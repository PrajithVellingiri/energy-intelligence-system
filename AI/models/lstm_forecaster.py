"""
LSTM-based energy consumption forecasting model.
Uses PyTorch for time-series prediction with sliding window approach.
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, Optional
import os


class LSTMForecaster(nn.Module):
    """Stacked LSTM model for energy consumption forecasting."""
    
    def __init__(
        self,
        input_size: int = 1,
        hidden_size: int = 64,
        num_layers: int = 2,
        dropout: float = 0.2,
        output_size: int = 1,
    ):
        super(LSTMForecaster, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, seq_len, input_size)
        lstm_out, _ = self.lstm(x)
        # Take only the last time step output
        last_output = lstm_out[:, -1, :]
        out = self.dropout(last_output)
        out = self.fc(out)
        return out


class LSTMTrainer:
    """Training and inference engine for the LSTM forecaster."""
    
    def __init__(
        self,
        model: LSTMForecaster,
        learning_rate: float = 0.001,
        device: str = None,
    ):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = model.to(self.device)
        self.criterion = nn.MSELoss()
        self.optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        epochs: int = 50,
        batch_size: int = 32,
        patience: int = 10,
    ) -> dict:
        """Train the LSTM model with early stopping."""
        
        # Convert to tensors
        X_train_t = torch.FloatTensor(X_train).unsqueeze(-1).to(self.device)
        y_train_t = torch.FloatTensor(y_train).unsqueeze(-1).to(self.device)
        X_val_t = torch.FloatTensor(X_val).unsqueeze(-1).to(self.device)
        y_val_t = torch.FloatTensor(y_val).unsqueeze(-1).to(self.device)
        
        # Create data loader
        train_dataset = torch.utils.data.TensorDataset(X_train_t, y_train_t)
        train_loader = torch.utils.data.DataLoader(
            train_dataset, batch_size=batch_size, shuffle=True
        )
        
        best_val_loss = float("inf")
        patience_counter = 0
        train_losses = []
        val_losses = []
        
        for epoch in range(epochs):
            # Training phase
            self.model.train()
            epoch_loss = 0.0
            n_batches = 0
            
            for batch_X, batch_y in train_loader:
                self.optimizer.zero_grad()
                predictions = self.model(batch_X)
                loss = self.criterion(predictions, batch_y)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                self.optimizer.step()
                epoch_loss += loss.item()
                n_batches += 1
            
            avg_train_loss = epoch_loss / n_batches
            train_losses.append(avg_train_loss)
            
            # Validation phase
            self.model.eval()
            with torch.no_grad():
                val_predictions = self.model(X_val_t)
                val_loss = self.criterion(val_predictions, y_val_t).item()
            val_losses.append(val_loss)
            
            if (epoch + 1) % 5 == 0:
                print(f"Epoch [{epoch+1}/{epochs}] Train Loss: {avg_train_loss:.6f} Val Loss: {val_loss:.6f}")
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                best_state = self.model.state_dict().copy()
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f"Early stopping at epoch {epoch+1}")
                    break
        
        # Restore best model
        self.model.load_state_dict(best_state)
        
        return {
            "train_losses": train_losses,
            "val_losses": val_losses,
            "best_val_loss": best_val_loss,
            "epochs_trained": len(train_losses),
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions on input sequences."""
        self.model.eval()
        with torch.no_grad():
            X_t = torch.FloatTensor(X).unsqueeze(-1).to(self.device)
            predictions = self.model(X_t)
        return predictions.cpu().numpy().flatten()
    
    def forecast_multistep(
        self, last_sequence: np.ndarray, n_steps: int = 24
    ) -> np.ndarray:
        """Recursive multi-step forecasting."""
        self.model.eval()
        predictions = []
        current_seq = last_sequence.copy()
        
        for _ in range(n_steps):
            with torch.no_grad():
                x = torch.FloatTensor(current_seq).unsqueeze(0).unsqueeze(-1).to(self.device)
                pred = self.model(x).cpu().numpy().flatten()[0]
            predictions.append(pred)
            # Shift window and append prediction
            current_seq = np.append(current_seq[1:], pred)
        
        return np.array(predictions)
    
    def save_model(self, path: str):
        """Save model checkpoint."""
        torch.save({
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "hidden_size": self.model.hidden_size,
            "num_layers": self.model.num_layers,
        }, path)
        print(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load model checkpoint."""
        checkpoint = torch.load(path, map_location=self.device, weights_only=False)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        print(f"Model loaded from {path}")
