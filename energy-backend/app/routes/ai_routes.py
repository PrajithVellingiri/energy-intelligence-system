"""
AI API routes: CSV upload, analysis, and training.
All routes are protected by JWT authentication.
The dashboard is now entirely CSV-driven - no sample data is served.
Analysis reports are persisted per-user so they can be viewed on subsequent logins.
"""

import io
import json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.auth_service import get_current_user_id
from app.services.ai_service import ai_service, compute_data_hash
from app.models_db.database import get_db
from app.models_db.trained_dataset import TrainedDataset
from app.models_db.analysis_report import AnalysisReport
from preprocessing.csv_analyzer import SmartCSVAnalyzer

router = APIRouter(prefix="/api", tags=["AI Analytics"])


@router.get("/model-status")
async def get_model_status(user_id: int = Depends(get_current_user_id)):
    """Get current model status: whether models are loaded and training metrics."""
    has_forecaster = ai_service.forecaster is not None
    has_anomaly = (
        ai_service.anomaly_detector is not None
        and ai_service.anomaly_detector.is_fitted
    )
    return {
        "models_loaded": has_forecaster and has_anomaly,
        "has_forecaster": has_forecaster,
        "has_anomaly_detector": has_anomaly,
        "is_optimal": ai_service.is_model_optimal,
        "current_val_loss": ai_service.current_val_loss,
    }


@router.post("/analyze-csv")
async def analyze_csv(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and analyze a CSV energy dataset.
    Also checks if the data has been used for training before.
    If not, trains the model with this data (unless model is already optimal).
    Returns full analytics for the uploaded CSV.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if len(raw_df) < 10:
        raise HTTPException(status_code=400, detail="CSV file has too few rows (minimum 10).")

    # Compute hash of the raw data for deduplication
    data_hash = compute_data_hash(raw_df)

    # Check if this dataset has already been used for training
    result_row = await db.execute(
        select(TrainedDataset).where(TrainedDataset.data_hash == data_hash)
    )
    already_trained = result_row.scalar_one_or_none() is not None

    # Normalize the data first (needed for both training and analysis)
    try:
        analyzer = SmartCSVAnalyzer()
        normalized_df, _detection_info = analyzer.analyze_and_normalize(raw_df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to normalize CSV: {str(e)}")

    # Train with this data if it hasn't been used before
    training_info = None
    if not already_trained:
        training_info = ai_service.train_with_data(normalized_df)

        # Record this dataset as trained (even if training was skipped due to optimal)
        trained_record = TrainedDataset(
            data_hash=data_hash,
            filename=file.filename,
            record_count=len(raw_df),
            lstm_val_loss=(
                training_info.get("lstm", {}).get("best_val_loss")
                if training_info.get("trained")
                else None
            ),
            anomaly_count=(
                training_info.get("anomaly_detector", {}).get("anomalies_found")
                if training_info.get("trained")
                else None
            ),
        )
        db.add(trained_record)
        await db.commit()
    else:
        training_info = {
            "trained": False,
            "reason": "This dataset has already been used for training",
        }

    # Now run full analysis on the uploaded data
    try:
        analysis_result = ai_service.analyze_user_dataset(raw_df)
        analysis_result["training_info"] = training_info
        analysis_result["data_hash"] = data_hash
        analysis_result["already_trained_before"] = already_trained
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Persist the report for this user
    summary = analysis_result.get("dashboard_summary", {})
    health = analysis_result.get("analysis", {}).get("health_score") or {}
    anomalies_info = analysis_result.get("analysis", {}).get("anomalies") or {}
    anomaly_summary = anomalies_info.get("summary", {})

    report = AnalysisReport(
        user_id=user_id,
        filename=file.filename,
        data_hash=data_hash,
        record_count=len(raw_df),
        result_json=json.dumps(analysis_result, default=str),
        avg_24h=summary.get("avg_24h"),
        max_24h=summary.get("max_24h"),
        health_score=health.get("energy_health_score"),
        health_grade=health.get("grade"),
        anomaly_count=anomaly_summary.get("total_anomalies"),
        total_records=summary.get("total_records"),
        date_range_start=summary.get("date_range", {}).get("start"),
        date_range_end=summary.get("date_range", {}).get("end"),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Add the report ID to the response
    analysis_result["report_id"] = report.id

    return analysis_result


@router.get("/reports")
async def list_reports(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all analysis reports for the current user, newest first."""
    result = await db.execute(
        select(AnalysisReport)
        .where(AnalysisReport.user_id == user_id)
        .order_by(AnalysisReport.created_at.desc())
    )
    reports = result.scalars().all()

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "record_count": r.record_count,
            "avg_24h": r.avg_24h,
            "max_24h": r.max_24h,
            "health_score": r.health_score,
            "health_grade": r.health_grade,
            "anomaly_count": r.anomaly_count,
            "total_records": r.total_records,
            "date_range_start": r.date_range_start,
            "date_range_end": r.date_range_end,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.get("/reports/{report_id}")
async def get_report(
    report_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the full analysis result for a specific report owned by the current user."""
    result = await db.execute(
        select(AnalysisReport).where(
            AnalysisReport.id == report_id,
            AnalysisReport.user_id == user_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    analysis_result = json.loads(report.result_json)
    analysis_result["report_id"] = report.id
    analysis_result["created_at"] = report.created_at.isoformat() if report.created_at else None
    return analysis_result


@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a specific report owned by the current user."""
    result = await db.execute(
        select(AnalysisReport).where(
            AnalysisReport.id == report_id,
            AnalysisReport.user_id == user_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    await db.delete(report)
    await db.commit()
    return {"detail": "Report deleted successfully."}
