"""
Phase 2: Walmart Sales Forecasting — Data Preprocessing Class
--------------------------------------------------------------
Takes Store, Dept, and Date as input and automatically performs:
  - Merging with stores.csv and features.csv
  - Feature engineering (time-based, cyclical, lag, rolling)
  - Categorical encoding
  - Returns a fully model-ready feature vector
"""

import pandas as pd
import numpy as np
import joblib
import os


class WalmartPreprocessor:
    """
    Preprocesses raw (Store, Dept, Date) inputs into a model-ready
    feature vector, mirroring all transformations applied during training.

    Usage
    -----
        preprocessor = WalmartPreprocessor(
            stores_path   = '/Users/raniaf./Desktop/walmart-app/archive (2) 3/stores.csv',
            features_path = '/Users/raniaf./Desktop/walmart-app/archive (2) 3/features.csv',
            train_path    = '/Users/raniaf./Desktop/walmart-app/archive (2) 3/train.csv',
            metadata_path = '/Users/raniaf./Downloads/model_metadata.joblib',
            encoder_path  = '/Users/raniaf./Downloads/label_encoder.joblib',
        )

        # Single prediction
        X = preprocessor.transform(store=1, dept=1, date='2012-11-02')

        # Batch prediction
        inputs = [
            {'store': 1, 'dept': 1,  'date': '2012-11-02'},
            {'store': 5, 'dept': 92, 'date': '2012-11-09'},
        ]
        X = preprocessor.transform_batch(inputs)
    """

    # ── Column lists ──────────────────────────────────────────
    MARKDOWN_COLS = ['MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5']

    def __init__(
        self,
        stores_path: str,
        features_path: str,
        train_path: str,
        metadata_path: str,
        encoder_path: str,
    ):
        """
        Parameters
        ----------
        stores_path   : path to stores.csv
        features_path : path to features.csv
        train_path    : path to train.csv  (needed for lag/rolling lookups)
        metadata_path : path to model_metadata.joblib
        encoder_path  : path to label_encoder.joblib
        """
        print("[Preprocessor] Loading reference data...")

        # ── Load & clean stores ───────────────────────────────
        self.stores_df = pd.read_csv(stores_path)

        # ── Load & clean features ─────────────────────────────
        self.features_df = pd.read_csv(features_path)
        self.features_df['Date'] = pd.to_datetime(self.features_df['Date'])
        self.features_df['IsHoliday'] = self.features_df['IsHoliday'].astype(int)
        self.features_df[self.MARKDOWN_COLS] = self.features_df[self.MARKDOWN_COLS].fillna(0)
        self.features_df['CPI'].fillna(self.features_df['CPI'].median(), inplace=True)
        self.features_df['Unemployment'].fillna(self.features_df['Unemployment'].median(), inplace=True)

        # ── Load training history for lag/rolling lookups ─────
        print("[Preprocessor] Building lag/rolling lookup tables from train.csv...")
        train_df = pd.read_csv(train_path)
        train_df['Date'] = pd.to_datetime(train_df['Date'])
        train_df = train_df.sort_values(['Store', 'Dept', 'Date']).reset_index(drop=True)

        grp = train_df.groupby(['Store', 'Dept'])['Weekly_Sales']
        train_df['Roll_mean_4']  = grp.shift(1).transform(lambda x: x.rolling(4,  min_periods=1).mean())
        train_df['Roll_mean_13'] = grp.shift(1).transform(lambda x: x.rolling(13, min_periods=1).mean())
        train_df['Roll_std_4']   = grp.shift(1).transform(lambda x: x.rolling(4,  min_periods=1).std()).fillna(0)

        # Last known values per (Store, Dept)
        self._last_known = (
            train_df.sort_values('Date')
                    .groupby(['Store', 'Dept'])
                    .agg(
                        Lag_1        = ('Weekly_Sales', 'last'),
                        Roll_mean_4  = ('Roll_mean_4',  'last'),
                        Roll_mean_13 = ('Roll_mean_13', 'last'),
                        Roll_std_4   = ('Roll_std_4',   'last'),
                    )
                    .reset_index()
        )

        # Lag-52 lookup: (Store, Dept, Week) → sales from same week last year
        self._lag52_map = (
            train_df[['Store', 'Dept', 'Date', 'Weekly_Sales']].copy()
        )
        self._lag52_map['Week']    = self._lag52_map['Date'].dt.isocalendar().week.astype(int)
        self._lag52_map['Year']    = self._lag52_map['Date'].dt.year
        self._lag52_map = self._lag52_map.rename(columns={'Weekly_Sales': 'Lag_52'})

        # Global median fallback for missing lags
        self._global_median = float(train_df['Weekly_Sales'].median())

        # ── Load model metadata & encoder ────────────────────
        meta = joblib.load(metadata_path)
        self.feature_cols = meta['feature_cols']

        self.label_encoder = joblib.load(encoder_path)

        print(f"[Preprocessor] Ready. Feature vector length: {len(self.feature_cols)}")
        print(f"[Preprocessor] Known stores: {sorted(self.stores_df['Store'].tolist())}")

    # ─────────────────────────────────────────────────────────
    # PUBLIC API
    # ─────────────────────────────────────────────────────────

    def transform(self, store: int, dept: int, date: str) -> pd.DataFrame:
        """
        Transform a single (Store, Dept, Date) input into a model-ready
        DataFrame with one row and all feature columns.

        Parameters
        ----------
        store : int   — Walmart store number (1–45)
        dept  : int   — Department number
        date  : str   — Date string, e.g. '2012-11-02'

        Returns
        -------
        pd.DataFrame with shape (1, n_features), column-aligned to feature_cols
        """
        row = pd.DataFrame([{
            'Store': int(store),
            'Dept':  int(dept),
            'Date':  pd.to_datetime(date),
        }])
        return self._pipeline(row)

    def transform_batch(self, inputs: list) -> pd.DataFrame:
        """
        Transform a list of dicts into a model-ready DataFrame.

        Parameters
        ----------
        inputs : list of dicts, each with keys 'store', 'dept', 'date'
                 e.g. [{'store': 1, 'dept': 1, 'date': '2012-11-02'}, ...]

        Returns
        -------
        pd.DataFrame with shape (n, n_features), column-aligned to feature_cols
        """
        rows = pd.DataFrame([{
            'Store': int(r['store']),
            'Dept':  int(r['dept']),
            'Date':  pd.to_datetime(r['date']),
        } for r in inputs])
        return self._pipeline(rows)

    def get_feature_names(self) -> list:
        """Return the ordered list of feature column names the model expects."""
        return self.feature_cols.copy()

    def validate_input(self, store: int, dept: int, date: str) -> dict:
        """
        Validate a raw input before transforming. Returns a dict with
        'valid' (bool) and 'errors' (list of str).
        """
        errors = []
        valid_stores = self.stores_df['Store'].tolist()

        if int(store) not in valid_stores:
            errors.append(f"Store {store} not found. Valid range: 1–{max(valid_stores)}")

        try:
            pd.to_datetime(date)
        except Exception:
            errors.append(f"Invalid date format: '{date}'. Use YYYY-MM-DD.")

        if int(dept) < 1 or int(dept) > 99:
            errors.append(f"Dept {dept} seems out of range (expected 1–99).")

        return {'valid': len(errors) == 0, 'errors': errors}

    # ─────────────────────────────────────────────────────────
    # INTERNAL PIPELINE
    # ─────────────────────────────────────────────────────────

    def _pipeline(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run the full preprocessing pipeline on a raw Store/Dept/Date DataFrame."""
        df = df.copy()
        df = self._merge_stores(df)
        df = self._merge_features(df)
        df = self._add_time_features(df)
        df = self._add_lag_rolling_features(df)
        df = self._encode_categoricals(df)
        df = self._select_and_align(df)
        return df

    def _merge_stores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Merge store metadata (Type, Size)."""
        df = df.merge(self.stores_df, on='Store', how='left')
        return df

    def _merge_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Merge the features table on (Store, Date).
        For dates not present in features.csv, forward-fills the nearest
        prior date's values as a sensible fallback.
        """
        # Find the closest available feature row for each requested date
        merged_rows = []
        for _, row in df.iterrows():
            store_feats = self.features_df[self.features_df['Store'] == row['Store']].copy()
            if store_feats.empty:
                # Store not in features — build a zero row
                feat_row = pd.Series({
                    'IsHoliday':    0,
                    'Temperature':  self.features_df['Temperature'].median(),
                    'Fuel_Price':   self.features_df['Fuel_Price'].median(),
                    'CPI':          self.features_df['CPI'].median(),
                    'Unemployment': self.features_df['Unemployment'].median(),
                    **{c: 0 for c in self.MARKDOWN_COLS},
                })
            else:
                store_feats = store_feats.sort_values('Date')
                # Pick exact date if available, else nearest past date
                exact = store_feats[store_feats['Date'] == row['Date']]
                if not exact.empty:
                    feat_row = exact.iloc[0]
                else:
                    past = store_feats[store_feats['Date'] <= row['Date']]
                    feat_row = past.iloc[-1] if not past.empty else store_feats.iloc[0]

            for col in ['IsHoliday', 'Temperature', 'Fuel_Price', 'CPI',
                        'Unemployment'] + self.MARKDOWN_COLS:
                row[col] = feat_row[col]

            merged_rows.append(row)

        return pd.DataFrame(merged_rows).reset_index(drop=True)

    def _add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract and encode all time-based features from the Date column."""
        df['Year']        = df['Date'].dt.year
        df['Month']       = df['Date'].dt.month
        df['Week']        = df['Date'].dt.isocalendar().week.astype(int)
        df['DayOfYear']   = df['Date'].dt.dayofyear
        df['Quarter']     = df['Date'].dt.quarter
        df['IsYearEnd']   = (df['Month'] == 12).astype(int)
        df['IsYearStart'] = (df['Month'] == 1).astype(int)

        # Cyclical encoding — preserves the circular nature of month/week
        df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
        df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)
        df['Week_sin']  = np.sin(2 * np.pi * df['Week']  / 52)
        df['Week_cos']  = np.cos(2 * np.pi * df['Week']  / 52)
        return df

    def _add_lag_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Attach lag and rolling features from training history.
        For any (Store, Dept) not seen during training, falls back
        to the global median.
        """
        df = df.merge(self._last_known, on=['Store', 'Dept'], how='left')

        # Lag_52: same week of the previous year
        df = df.merge(
            self._lag52_map[['Store', 'Dept', 'Week', 'Year', 'Lag_52']],
            left_on  = ['Store', 'Dept', 'Week', 'Year'],
            right_on = ['Store', 'Dept', 'Week', 'Year'],
            how='left'
        )

        # Lag_2 and Lag_4 use Lag_1 as a proxy for unseen future dates
        df['Lag_2'] = df['Lag_1']
        df['Lag_4'] = df['Lag_1']

        # Fill missing with global median
        for col in ['Lag_1', 'Lag_2', 'Lag_4', 'Lag_52',
                    'Roll_mean_4', 'Roll_mean_13', 'Roll_std_4']:
            df[col] = df[col].fillna(self._global_median)

        return df

    def _encode_categoricals(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode the store Type column using the fitted LabelEncoder."""
        df['IsHoliday'] = df['IsHoliday'].astype(int)
        # Handle unseen store types gracefully
        known_classes = list(self.label_encoder.classes_)
        df['Type'] = df['Type'].apply(
            lambda t: t if t in known_classes else known_classes[0]
        )
        df['Type_enc'] = self.label_encoder.transform(df['Type'])
        return df

    def _select_and_align(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Select exactly the model's expected feature columns in the correct
        order. Fills any remaining NaN with 0.
        """
        for col in self.feature_cols:
            if col not in df.columns:
                df[col] = 0
        return df[self.feature_cols].fillna(0).reset_index(drop=True)


# ─────────────────────────────────────────────────────────────
# QUICK TEST  (run this file directly to verify the class works)
# ─────────────────────────────────────────────────────────────
if __name__ == '__main__':

    BASE   = '/Users/raniaf./Desktop/walmart-app'
    CSVS   = f'{BASE}/archive (2) 3'

    preprocessor = WalmartPreprocessor(
        stores_path   = f'{CSVS}/stores.csv',
        features_path = f'{CSVS}/features.csv',
        train_path    = f'{CSVS}/train.csv',
        metadata_path = f'{BASE}/model_metadata.joblib',
        encoder_path  = f'{BASE}/label_encoder.joblib',
    )

    # ── Single input ─────────────────────────────────────────
    print("\n--- Single transform ---")
    X = preprocessor.transform(store=1, dept=1, date='2012-11-02')
    print(X.T)  # transpose for readable vertical display

    # ── Batch input ──────────────────────────────────────────
    print("\n--- Batch transform (3 rows) ---")
    X_batch = preprocessor.transform_batch([
        {'store': 1,  'dept': 1,  'date': '2012-11-02'},
        {'store': 5,  'dept': 92, 'date': '2012-11-09'},
        {'store': 20,'dept': 14, 'date': '2012-12-28'},
    ])
    print(X_batch)

    # ── Validation ───────────────────────────────────────────
    print("\n--- Input validation ---")
    print(preprocessor.validate_input(store=1,   dept=1,  date='2012-11-02'))  # valid
    print(preprocessor.validate_input(store=999, dept=1,  date='2012-11-02'))  # bad store
    print(preprocessor.validate_input(store=1,   dept=1,  date='not-a-date'))  # bad date

    # ── Run prediction with saved models ─────────────────────
    print("\n--- End-to-end prediction ---")
    rf = joblib.load(f'{BASE}/model_random_forest.joblib')
    gb = joblib.load(f'{BASE}/model_gradient_boosting.joblib')

    X = preprocessor.transform(store=1, dept=1, date='2012-11-02')
    pred = 0.6 * rf.predict(X)[0] + 0.4 * gb.predict(X)[0]
    print(f"  Store 1 | Dept 1 | 2012-11-02  =>  Predicted Weekly Sales: ${pred:,.2f}")
