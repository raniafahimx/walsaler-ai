"""
Task 7: Walmart Sales Forecasting
- Time-based features (day, month, lag values)
- Rolling averages and seasonal decomposition (manual)
- Gradient Boosting + Random Forest ensemble with time-aware validation
- Actual vs. predicted plots
- Phase 1: Exports trained models and LabelEncoder as .joblib files
"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import LabelEncoder
from scipy.ndimage import uniform_filter1d
import joblib  # Phase 1

# ─── OUTPUT DIRECTORY ────────────────────────────────────────
OUTPUT_DIR = '/Users/raniaf./Desktop/walmart-app'

print("="*60)
print("WALMART SALES FORECASTING - TASK 7")
print("="*60)

# ─── 1. LOAD DATA ────────────────────────────────────────────
print("\n[1] Loading data...")
train    = pd.read_csv('/Users/raniaf./Desktop/walmart-app/archive (2) 3/train.csv')
test     = pd.read_csv('/Users/raniaf./Desktop/walmart-app/archive (2) 3/test.csv')
features = pd.read_csv('/Users/raniaf./Desktop/walmart-app/archive (2) 3/features.csv')
stores   = pd.read_csv('/Users/raniaf./Desktop/walmart-app/archive (2) 3/stores.csv')

for df in [train, test, features]:
    df['Date'] = pd.to_datetime(df['Date'])

print(f"  Train: {train.shape}  |  Test: {test.shape}")
print(f"  Train date range: {train['Date'].min().date()} -> {train['Date'].max().date()}")

# ─── 2. MERGE ────────────────────────────────────────────────
print("\n[2] Merging datasets...")
train = train.merge(features, on=['Store','Date','IsHoliday'], how='left')
train = train.merge(stores,   on=['Store'], how='left')
test  = test.merge(features,  on=['Store','Date','IsHoliday'], how='left')
test  = test.merge(stores,    on=['Store'], how='left')

md_cols = ['MarkDown1','MarkDown2','MarkDown3','MarkDown4','MarkDown5']
for df in [train, test]:
    df[md_cols] = df[md_cols].fillna(0)
    df['CPI'].fillna(df['CPI'].median(), inplace=True)
    df['Unemployment'].fillna(df['Unemployment'].median(), inplace=True)

# ─── 3. TIME-BASED FEATURES ──────────────────────────────────
print("\n[3] Engineering time-based features...")

def add_time_features(df):
    df = df.copy()
    df['Year']        = df['Date'].dt.year
    df['Month']       = df['Date'].dt.month
    df['Week']        = df['Date'].dt.isocalendar().week.astype(int)
    df['DayOfYear']   = df['Date'].dt.dayofyear
    df['Quarter']     = df['Date'].dt.quarter
    df['IsYearEnd']   = (df['Month'] == 12).astype(int)
    df['IsYearStart'] = (df['Month'] == 1).astype(int)
    df['Month_sin']   = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_cos']   = np.cos(2 * np.pi * df['Month'] / 12)
    df['Week_sin']    = np.sin(2 * np.pi * df['Week'] / 52)
    df['Week_cos']    = np.cos(2 * np.pi * df['Week'] / 52)
    return df

train = add_time_features(train)
test  = add_time_features(test)

# ─── 4. LAG & ROLLING FEATURES ───────────────────────────────
print("\n[4] Creating lag and rolling average features...")
train = train.sort_values(['Store','Dept','Date']).reset_index(drop=True)
grp   = train.groupby(['Store','Dept'])['Weekly_Sales']

train['Lag_1']        = grp.shift(1)
train['Lag_2']        = grp.shift(2)
train['Lag_4']        = grp.shift(4)
train['Lag_52']       = grp.shift(52)
train['Roll_mean_4']  = grp.shift(1).transform(lambda x: x.rolling(4,  min_periods=1).mean())
train['Roll_mean_13'] = grp.shift(1).transform(lambda x: x.rolling(13, min_periods=1).mean())
train['Roll_std_4']   = grp.shift(1).transform(lambda x: x.rolling(4,  min_periods=1).std()).fillna(0)

last_known = (train.sort_values('Date')
                   .groupby(['Store','Dept'])
                   .agg(Lag_1=('Weekly_Sales','last'),
                        Roll_mean_4=('Roll_mean_4','last'),
                        Roll_mean_13=('Roll_mean_13','last'),
                        Roll_std_4=('Roll_std_4','last'))
                   .reset_index())

lag52_map = (train[['Store','Dept','Week','Year','Weekly_Sales']]
             .rename(columns={'Weekly_Sales':'Lag_52','Year':'LagYear'}))
lag52_map['LagYear'] += 1

test = test.merge(last_known, on=['Store','Dept'], how='left')
test = test.merge(lag52_map[['Store','Dept','Week','LagYear','Lag_52']],
                  left_on=['Store','Dept','Week','Year'],
                  right_on=['Store','Dept','Week','LagYear'], how='left')
test['Lag_2'] = test['Lag_1']
test['Lag_4'] = test['Lag_1']

lag_roll_cols = ['Lag_1','Lag_2','Lag_4','Lag_52','Roll_mean_4','Roll_mean_13','Roll_std_4']
global_median = train['Weekly_Sales'].median()
train[lag_roll_cols] = train[lag_roll_cols].fillna(global_median)
test[lag_roll_cols]  = test[lag_roll_cols].fillna(global_median)

# ─── 5. ENCODE CATEGORICALS ──────────────────────────────────
le = LabelEncoder()
all_types = pd.concat([train['Type'], test['Type']])
le.fit(all_types)
train['Type_enc'] = le.transform(train['Type'])
test['Type_enc']  = le.transform(test['Type'])
train['IsHoliday'] = train['IsHoliday'].astype(int)
test['IsHoliday']  = test['IsHoliday'].astype(int)

# ─── 6. FEATURE LIST ─────────────────────────────────────────
feature_cols = [
    'Store','Dept','Type_enc','Size',
    'Year','Month','Week','DayOfYear','Quarter',
    'IsHoliday','IsYearEnd','IsYearStart',
    'Month_sin','Month_cos','Week_sin','Week_cos',
    'Temperature','Fuel_Price','CPI','Unemployment',
    'MarkDown1','MarkDown2','MarkDown3','MarkDown4','MarkDown5',
    'Lag_1','Lag_2','Lag_4','Lag_52',
    'Roll_mean_4','Roll_mean_13','Roll_std_4',
]

# ─── 7. TIME-AWARE VALIDATION SPLIT ──────────────────────────
print("\n[5] Time-aware train/validation split...")
cutoff = pd.Timestamp('2012-04-01')
tr = train[train['Date'] <  cutoff]
va = train[train['Date'] >= cutoff].copy()
print(f"  Train set : {len(tr):,} rows")
print(f"  Val   set : {len(va):,} rows  ({va['Date'].min().date()} -> {va['Date'].max().date()})")

X_tr, y_tr = tr[feature_cols], tr['Weekly_Sales']
X_va, y_va = va[feature_cols], va['Weekly_Sales']

# ─── 8. RANDOM FOREST MODEL ──────────────────────────────────
print("\n[6] Training Random Forest model...")
rf = RandomForestRegressor(
    n_estimators=200, max_depth=20, min_samples_leaf=5,
    max_features=0.6, random_state=42, n_jobs=-1)
rf.fit(X_tr, y_tr)
va_pred_rf = np.clip(rf.predict(X_va), 0, None)
mae_rf  = mean_absolute_error(y_va, va_pred_rf)
rmse_rf = np.sqrt(mean_squared_error(y_va, va_pred_rf))
print(f"  Random Forest  ->  MAE: ${mae_rf:,.2f}  |  RMSE: ${rmse_rf:,.2f}")

# ─── 9. GRADIENT BOOSTING MODEL ──────────────────────────────
print("\n[7] Training Gradient Boosting model...")
sample_idx = tr.sample(frac=0.4, random_state=42).index
X_tr_s, y_tr_s = tr.loc[sample_idx, feature_cols], tr.loc[sample_idx, 'Weekly_Sales']

gb = GradientBoostingRegressor(
    n_estimators=300, learning_rate=0.08, max_depth=6,
    min_samples_leaf=10, subsample=0.8, random_state=42)
gb.fit(X_tr_s, y_tr_s)
va_pred_gb = np.clip(gb.predict(X_va), 0, None)
mae_gb  = mean_absolute_error(y_va, va_pred_gb)
rmse_gb = np.sqrt(mean_squared_error(y_va, va_pred_gb))
print(f"  Gradient Boost ->  MAE: ${mae_gb:,.2f}  |  RMSE: ${rmse_gb:,.2f}")

# ─── 10. ENSEMBLE ────────────────────────────────────────────
print("\n[8] Ensembling (RF 60% + GB 40%)...")
va_pred = 0.6 * va_pred_rf + 0.4 * va_pred_gb
mae  = mean_absolute_error(y_va, va_pred)
rmse = np.sqrt(mean_squared_error(y_va, va_pred))
wmae = mae / y_va.mean() * 100
print(f"  Ensemble  ->  MAE: ${mae:,.2f}  |  RMSE: ${rmse:,.2f}  |  WMAE: {wmae:.2f}%")
va['Predicted'] = va_pred

# ─── 11. EXPORT MODELS  (PHASE 1) ────────────────────────────
print("\n[9] Saving models as .joblib files...")

joblib.dump(rf, f'{OUTPUT_DIR}/model_random_forest.joblib')
print("  Saved: model_random_forest.joblib")

joblib.dump(gb, f'{OUTPUT_DIR}/model_gradient_boosting.joblib')
print("  Saved: model_gradient_boosting.joblib")

joblib.dump(le, f'{OUTPUT_DIR}/label_encoder.joblib')
print("  Saved: label_encoder.joblib")

# Metadata bundle — everything the web app needs to reconstruct predictions
joblib.dump({
    'feature_cols':  feature_cols,
    'global_median': global_median,
    'rf_weight':     0.6,
    'gb_weight':     0.4,
    'mae':           mae,
    'rmse':          rmse,
    'wmae':          wmae,
}, f'{OUTPUT_DIR}/model_metadata.joblib')
print("  Saved: model_metadata.joblib")

# ─── 12. SEASONAL DECOMPOSITION ──────────────────────────────
print("\n[10] Seasonal decomposition (manual)...")
weekly_total  = train.groupby('Date')['Weekly_Sales'].sum().sort_index()
weekly_series = weekly_total.values.astype(float)
dates_w       = weekly_total.index
n = len(weekly_series)

window = 52
trend  = np.convolve(weekly_series, np.ones(window)/window, mode='same')
for i in range(window // 2):
    trend[i]      = np.mean(weekly_series[:max(1, i*2+1)])
    trend[-(i+1)] = np.mean(weekly_series[-(max(1, i*2+1)):])

detrended    = weekly_series - trend
period       = 52
seasonal_avg = np.array([np.mean(detrended[i::period]) for i in range(period)])
seasonal_avg -= seasonal_avg.mean()

# ─── 13. PLOTS ───────────────────────────────────────────────
print("\n[11] Generating plots...")

BG     = '#0d1117'
PANEL  = '#161b22'
GOLD   = '#f0c040'
RED    = '#e05260'
CYAN   = '#58d6c8'
PURPLE = '#bc8cff'
WHITE  = '#c9d1d9'
GRAY   = '#8b949e'

fig = plt.figure(figsize=(22, 30), facecolor=BG)
gs  = gridspec.GridSpec(4, 2, figure=fig, hspace=0.52, wspace=0.32,
                        left=0.07, right=0.97, top=0.95, bottom=0.04)

def style_ax(ax, title, xlabel='', ylabel=''):
    ax.set_facecolor(PANEL)
    ax.set_title(title, color=WHITE, fontsize=12, fontweight='bold', pad=10)
    ax.set_xlabel(xlabel, color=GRAY, fontsize=10)
    ax.set_ylabel(ylabel, color=GRAY, fontsize=10)
    ax.tick_params(colors=GRAY, which='both')
    for sp in ax.spines.values():
        sp.set_edgecolor('#30363d')
    ax.grid(True, color='#21262d', linewidth=0.8, alpha=0.7)

fmt_m = plt.FuncFormatter(lambda x, _: f'${x/1e6:.1f}M')
fmt_k = plt.FuncFormatter(lambda x, _: f'${x/1e3:.0f}K')

ax1 = fig.add_subplot(gs[0, :])
style_ax(ax1, 'Total Weekly Sales Across All Stores (2010-2012)', ylabel='Weekly Sales')
ax1.plot(dates_w, weekly_series, color=GOLD, lw=1.5, alpha=0.9, label='Actual Sales')
ax1.plot(dates_w, trend, color=CYAN, lw=2.5, linestyle='--', alpha=0.9, label='52-week Trend')
ax1.fill_between(dates_w, weekly_series, alpha=0.12, color=GOLD)
ax1.yaxis.set_major_formatter(fmt_m)
for hd in train[train['IsHoliday']==1]['Date'].unique():
    ax1.axvline(pd.Timestamp(hd), color=RED, alpha=0.06, lw=1)
ax1.legend(facecolor='#21262d', labelcolor=WHITE, fontsize=10)

ax2 = fig.add_subplot(gs[1, :])
style_ax(ax2, f'Actual vs. Predicted - Validation Set  |  MAE: ${mae:,.0f}  |  RMSE: ${rmse:,.0f}  |  WMAE: {wmae:.1f}%', ylabel='Weekly Sales')
agg = va.groupby('Date').agg(Actual=('Weekly_Sales','sum'), Predicted=('Predicted','sum'))
ax2.plot(agg.index, agg['Actual'],    color=GOLD, lw=2.2, label='Actual',    alpha=0.95)
ax2.plot(agg.index, agg['Predicted'], color=RED,  lw=2.2, label='Predicted', alpha=0.9, linestyle='--')
ax2.fill_between(agg.index, agg['Actual'], agg['Predicted'], alpha=0.12, color=CYAN)
ax2.yaxis.set_major_formatter(fmt_m)
ax2.legend(facecolor='#21262d', labelcolor=WHITE, fontsize=11)

ax3 = fig.add_subplot(gs[2, 0])
style_ax(ax3, 'Seasonal Decomposition - Trend Component', ylabel='Trend ($)')
ax3.plot(dates_w, trend, color=CYAN, lw=2)
ax3.fill_between(dates_w, trend, alpha=0.15, color=CYAN)
ax3.yaxis.set_major_formatter(fmt_m)

ax4 = fig.add_subplot(gs[2, 1])
style_ax(ax4, 'Seasonal Pattern - Avg Week-of-Year Effect', xlabel='Week of Year', ylabel='Seasonal Effect ($)')
ax4.bar(range(1, 53), seasonal_avg, color=[RED if v>0 else PURPLE for v in seasonal_avg], alpha=0.8, width=0.9)
ax4.axhline(0, color=GRAY, lw=1, linestyle='--')
ax4.yaxis.set_major_formatter(fmt_m)
peak_w = int(np.argmax(seasonal_avg)) + 1
ax4.annotate(f'Wk {peak_w}\n(Holiday Peak)',
             xy=(peak_w, seasonal_avg[peak_w-1]),
             xytext=(max(1, peak_w-8), seasonal_avg[peak_w-1]*0.75),
             color=WHITE, fontsize=9, arrowprops=dict(arrowstyle='->', color=GRAY))

ax5 = fig.add_subplot(gs[3, 0])
style_ax(ax5, 'Feature Importances (Random Forest - Top 20)', xlabel='Importance Score')
imp = pd.Series(rf.feature_importances_, index=feature_cols).sort_values(ascending=True).tail(20)
ax5.barh(imp.index, imp.values,
         color=[RED if v>imp.quantile(0.75) else GOLD if v>imp.quantile(0.5) else CYAN for v in imp.values],
         alpha=0.85, height=0.75)
ax5.tick_params(axis='y', labelsize=8.5, colors=WHITE)

ax6 = fig.add_subplot(gs[3, 1])
style_ax(ax6, 'Prediction Residuals Distribution (Validation Set)', xlabel='Residual ($)', ylabel='Count')
residuals = y_va.values - va_pred
ax6.hist(residuals, bins=100, color=PURPLE, edgecolor='#0d1117', alpha=0.85, linewidth=0.4)
ax6.axvline(0, color=GOLD, lw=2, linestyle='--', label='Zero error')
ax6.axvline(residuals.mean(), color=RED, lw=1.5, linestyle=':', label=f'Mean: ${residuals.mean():,.0f}')
ax6.xaxis.set_major_formatter(fmt_k)
ax6.legend(facecolor='#21262d', labelcolor=WHITE, fontsize=9)

fig.text(0.5, 0.975,
         'Walmart Sales Forecasting  |  RF + Gradient Boosting Ensemble  |  Time-Aware Validation',
         ha='center', va='top', fontsize=15, fontweight='bold', color=WHITE)

plt.savefig(f'{OUTPUT_DIR}/walmart_forecast_results.png', dpi=150, bbox_inches='tight', facecolor=BG)
plt.close()
print("  Saved: walmart_forecast_results.png")

# ─── 14. TEST PREDICTIONS ────────────────────────────────────
print("\n[12] Generating test predictions...")
pred_rf   = np.clip(rf.predict(test[feature_cols]), 0, None)
pred_gb   = np.clip(gb.predict(test[feature_cols]), 0, None)
test_pred = 0.6 * pred_rf + 0.4 * pred_gb

submission = test[['Store','Dept','Date']].copy()
submission['Weekly_Sales'] = test_pred
submission.to_csv(f'{OUTPUT_DIR}/walmart_predictions.csv', index=False)
print(f"  Saved: walmart_predictions.csv  ({len(submission):,} rows)")

# ─── SUMMARY ─────────────────────────────────────────────────
print("\n" + "="*60)
print("FINAL RESULTS")
print("="*60)
print(f"  Random Forest  MAE  : ${mae_rf:,.2f}")
print(f"  Gradient Boost MAE  : ${mae_gb:,.2f}")
print(f"  Ensemble       MAE  : ${mae:,.2f}")
print(f"  Ensemble       RMSE : ${rmse:,.2f}")
print(f"  WMAE                : {wmae:.2f}%")
print(f"  Features used       : {len(feature_cols)}")
print(f"  Test predictions    : {len(submission):,} weekly store-dept forecasts")
print("="*60)
print(f"\nPhase 1 - Model files saved to: {OUTPUT_DIR}/")
print("  model_random_forest.joblib      <- Random Forest model")
print("  model_gradient_boosting.joblib  <- Gradient Boosting model")
print("  label_encoder.joblib            <- Store Type encoder")
print("  model_metadata.joblib           <- feature_cols, weights, metrics")
print("="*60)
