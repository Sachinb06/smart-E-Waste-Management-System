"""
Architecture Diagram Generator for Smart E-Waste Management System
Generates a professional PNG architecture diagram using matplotlib.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np

fig, ax = plt.subplots(1, 1, figsize=(22, 16))
ax.set_xlim(0, 22)
ax.set_ylim(0, 16)
ax.axis('off')

# ── Color palette ──────────────────────────────────────────────
C_BG        = '#0d1117'   # dark canvas
C_GREEN     = '#16a34a'
C_DKGREEN   = '#14532d'
C_LTGREEN   = '#bbf7d0'
C_TEAL      = '#0d9488'
C_BLUE      = '#2563eb'
C_PURPLE    = '#7c3aed'
C_ORANGE    = '#ea580c'
C_YELLOW    = '#ca8a04'
C_GRAY      = '#374151'
C_LIGHTGRAY = '#6b7280'
C_WHITE     = '#f9fafb'
C_BORDER    = '#22c55e'

fig.patch.set_facecolor(C_BG)
ax.set_facecolor(C_BG)

# ── Helper: draw a rounded box ─────────────────────────────────
def box(ax, x, y, w, h, label, sublabel='', color='#1e3a2f', edge='#22c55e',
        fontsize=9, subfontsize=7.5, alpha=1.0, radius=0.3, icon=''):
    rect = FancyBboxPatch((x, y), w, h,
                          boxstyle=f"round,pad=0,rounding_size={radius}",
                          linewidth=1.5, edgecolor=edge,
                          facecolor=color, alpha=alpha, zorder=3)
    ax.add_patch(rect)
    cy = y + h / 2
    full_label = f"{icon}  {label}" if icon else label
    ax.text(x + w/2, cy + (0.12 if sublabel else 0), full_label,
            ha='center', va='center', fontsize=fontsize, color=C_WHITE,
            fontweight='bold', zorder=4)
    if sublabel:
        ax.text(x + w/2, cy - 0.22, sublabel,
                ha='center', va='center', fontsize=subfontsize,
                color='#86efac', zorder=4, style='italic')

# ── Helper: draw an arrow ──────────────────────────────────────
def arrow(ax, x1, y1, x2, y2, color='#22c55e', label='', lw=1.5,
          connectionstyle="arc3,rad=0"):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw,
                                connectionstyle=connectionstyle),
                zorder=5)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx, my + 0.12, label, ha='center', va='bottom',
                fontsize=6.5, color='#a3e635', zorder=6)

# ══════════════════════════════════════════════════════════════════════════
# TITLE
# ══════════════════════════════════════════════════════════════════════════
ax.text(11, 15.4, '♻  Smart E-Waste Management System',
        ha='center', va='center', fontsize=18, color='#4ade80',
        fontweight='bold', zorder=6)
ax.text(11, 14.95, 'System Architecture — Full-Stack AI + IoT Application',
        ha='center', va='center', fontsize=11, color='#86efac', zorder=6)

# Title underline
ax.plot([0.5, 21.5], [14.75, 14.75], color='#22c55e', lw=1.5, zorder=5)

# ══════════════════════════════════════════════════════════════════════════
# LAYER LABELS (left spine)
# ══════════════════════════════════════════════════════════════════════════
layers = [
    (13.4, 14.65, 'USER LAYER'),
    (10.6, 13.3,  'FRONTEND — React 18 + Vite 5 + Tailwind CSS'),
    (7.2,  9.5,   'BACKEND — FastAPI (Python 3.11)'),
    (4.5,  7.1,   'AI ENGINE'),
    (1.9,  4.4,   'DATA LAYER — SQLite + SQLAlchemy ORM'),
    (0.5,  1.85,  'IoT LAYER'),
]
for y_top, y_bot, lbl in layers:
    ax.text(0.18, (y_top+y_bot)/2, lbl, ha='center', va='center',
            fontsize=6.5, color='#86efac', rotation=90,
            fontweight='bold', zorder=6)
    ax.plot([0.35, 0.35], [y_bot, y_top], color='#166534', lw=1.2, zorder=4)

# ══════════════════════════════════════════════════════════════════════════
# 1. USER DEVICES (top row)
# ══════════════════════════════════════════════════════════════════════════
user_devices = [
    (1.0,  13.55, 2.4, 0.9, '📱 Mobile / Tablet', 'Chrome / Safari'),
    (4.2,  13.55, 2.4, 0.9, '💻 Desktop Browser', 'Chrome / Firefox / Edge'),
    (7.4,  13.55, 2.4, 0.9, '📷 Webcam / Camera', 'getUserMedia API'),
    (10.6, 13.55, 2.4, 0.9, '🔧 Arduino / ESP32', 'Ultrasonic Sensors'),
    (13.8, 13.55, 2.4, 0.9, '🖥️ Admin Terminal', 'Admin Dashboard'),
]
for (x, y, w, h, lbl, sub) in user_devices:
    box(ax, x, y, w, h, lbl, sub, color='#1e3a5f', edge='#3b82f6',
        fontsize=8, subfontsize=6.5)

# ══════════════════════════════════════════════════════════════════════════
# 2. FRONTEND PAGES (second row)
# ══════════════════════════════════════════════════════════════════════════
fe_pages = [
    (0.55, 11.8, 2.55, 1.2, '🏠 Home Page',       'Landing + Awareness'),
    (3.25, 11.8, 2.55, 1.2, '📷 AI Detection',     'Camera + Capture'),
    (5.95, 11.8, 2.55, 1.2, '📋 Results Page',     'BBox + Category'),
    (8.65, 11.8, 2.55, 1.2, '📦 Collection Req.',  'Form + Tracking'),
    (11.35,11.8, 2.55, 1.2, '🗺️ Centers Locator',  'Search + Filter'),
    (14.05,11.8, 2.55, 1.2, '📊 IoT Dashboard',    'Bin Levels'),
    (16.75,11.8, 2.55, 1.2, '📈 Analytics',        'Charts (Recharts)'),
    (19.25,11.8, 2.35, 1.2, '👤 Auth Pages',       'Login / Register'),
]

for (x, y, w, h, lbl, sub) in fe_pages:
    box(ax, x, y, w, h, lbl, sub, color='#14532d', edge='#22c55e',
        fontsize=7.5, subfontsize=6.5)

# Frontend services strip
box(ax, 0.55, 10.75, 8.9, 0.75, '⚙️  Frontend Services',
    'AuthContext  |  api.js (fetch client)  |  CameraService  |  BoundingBoxOverlay',
    color='#1a2e1a', edge='#4ade80', fontsize=8, subfontsize=7)
box(ax, 9.6, 10.75, 12.0, 0.75, '🧩  Reusable Components',
    'Navbar  |  Footer  |  StatusTimeline  |  HazardWarningBadge  |  Charts',
    color='#1a2e1a', edge='#4ade80', fontsize=8, subfontsize=7)

# ══════════════════════════════════════════════════════════════════════════
# 3. API GATEWAY / FASTAPI ROUTERS
# ══════════════════════════════════════════════════════════════════════════
box(ax, 0.55, 9.65, 21.05, 0.75, '🔀  FastAPI API Gateway  —  CORS Middleware  |  JWT Auth Middleware  |  Request Validation',
    'http://127.0.0.1:8000', color='#1c1917', edge='#f97316',
    fontsize=9, subfontsize=7)

routers = [
    (0.55, 8.35, 2.9, 1.1, '🔐 /api/auth',      'login · register\nrefresh token'),
    (3.55, 8.35, 2.9, 1.1, '🔍 /api/detect',     'POST detect-ewaste\nimage upload'),
    (6.55, 8.35, 2.9, 1.1, '📦 /api/requests',   'CRUD collection\nrequests'),
    (9.55, 8.35, 2.9, 1.1, '📡 /api/iot',        'bin levels\nsensor data'),
    (12.55,8.35, 2.9, 1.1, '🗺️ /api/centers',    'search · filter\nadmin CRUD'),
    (15.55,8.35, 2.9, 1.1, '📊 /api/analytics',  'category stats\ntrends'),
    (18.55,8.35, 2.9, 1.1, '👑 /api/admin',      'user mgmt\nCSV export'),
]
for (x, y, w, h, lbl, sub) in routers:
    box(ax, x, y, w, h, lbl, sub, color='#292524', edge='#f97316',
        fontsize=8, subfontsize=6.5)

# ══════════════════════════════════════════════════════════════════════════
# 4. AI ENGINE
# ══════════════════════════════════════════════════════════════════════════
box(ax, 0.55, 6.35, 21.05, 0.75,
    '🤖  AI Engine  —  detector.py  |  category_mapping.py  |  guidance.py',
    'YOLOv8 (ultralytics) · OpenCV · Pillow · Lazy Model Loading · Honest Fallback',
    color='#1e1b4b', edge='#7c3aed', fontsize=9, subfontsize=7)

ai_boxes = [
    (0.55,  5.1, 3.2, 1.0, '📥 Image Ingestion',   'File validation\ntype + size check'),
    (3.85,  5.1, 3.2, 1.0, '🖼️ Preprocessing',     'Resize · Normalize\nOpenCV / Pillow'),
    (7.15,  5.1, 3.2, 1.0, '🧠 YOLOv8 Inference',  'Object detection\nBBox + confidence'),
    (10.45, 5.1, 3.2, 1.0, '🏷️ Category Mapping',  '7 E-Waste categories\nexplicit rules'),
    (13.75, 5.1, 3.2, 1.0, '🪣 Bin Recommendation', 'Category → bin\nhazard check'),
    (17.05, 5.1, 4.55, 1.0, '⚠️ Uncertainty Handler','confidence < threshold\nretry / manual select'),
]
for (x, y, w, h, lbl, sub) in ai_boxes:
    box(ax, x, y, w, h, lbl, sub, color='#2e1065', edge='#a78bfa',
        fontsize=7.5, subfontsize=6.5)

# AI pipeline arrows
for i in range(len(ai_boxes)-1):
    x1 = ai_boxes[i][0] + ai_boxes[i][2]
    x2 = ai_boxes[i+1][0]
    cy = ai_boxes[i][1] + ai_boxes[i][3]/2
    arrow(ax, x1, cy, x2, cy, color='#a78bfa', lw=1.2)

# ══════════════════════════════════════════════════════════════════════════
# 5. DATABASE MODELS
# ══════════════════════════════════════════════════════════════════════════
box(ax, 0.55, 3.6, 21.05, 0.75,
    '🗄️  SQLite Database  —  SQLAlchemy ORM  |  Pydantic v2 Schemas  |  Alembic-Ready',
    'smart_ewaste.db  ·  Bcrypt password hashing  ·  UUID primary keys  ·  Timestamps',
    color='#1c1917', edge='#ca8a04', fontsize=9, subfontsize=7)

db_tables = [
    (0.55,  2.3, 3.1, 1.1, '👤 users',              'id · email · password_hash\nrole · created_at'),
    (3.75,  2.3, 3.2, 1.1, '🔍 detection_history',  'id · user_id · image_path\ncategory · confidence'),
    (7.05,  2.3, 3.3, 1.1, '📦 collection_requests','id · user_id · category\nstatus · address · date'),
    (10.45, 2.3, 3.2, 1.1, '🗺️ collection_centers', 'id · name · address\ncontact · categories'),
    (13.75, 2.3, 3.1, 1.1, '📡 iot_bins',           'id · name · category\nfill_level · status'),
    (16.95, 2.3, 4.65, 1.1, '📊 sensor_readings',   'id · bin_id · fill_level\ntimestamp · simulated'),
]
for (x, y, w, h, lbl, sub) in db_tables:
    box(ax, x, y, w, h, lbl, sub, color='#292524', edge='#fbbf24',
        fontsize=8, subfontsize=6.5)

# ══════════════════════════════════════════════════════════════════════════
# 6. IoT LAYER
# ══════════════════════════════════════════════════════════════════════════
iot_items = [
    (0.55,  0.6, 3.0, 1.0, '🔌 Arduino / ESP32',  'Ultrasonic HC-SR04\nWiFi / Serial'),
    (3.65,  0.6, 3.0, 1.0, '📡 Sensor API',        'POST /api/iot/reading\nJSON payload'),
    (6.75,  0.6, 3.0, 1.0, '🪣 Bin Monitor',       '4 bins · fill %\nstatus · alerts'),
    (9.85,  0.6, 3.5, 1.0, '📊 IoT Dashboard',     'Real-time Recharts\nSimulated fallback'),
    (13.45, 0.6, 3.5, 1.0, '🔔 Alert Engine',      'Capacity > 80%\nemail / notification'),
    (17.05, 0.6, 4.55, 1.0, '🏭 Physical Bins',    'Mobile · Computers\nBattery · Cables'),
]
for (x, y, w, h, lbl, sub) in iot_items:
    box(ax, x, y, w, h, lbl, sub, color='#1a2e1a', edge='#16a34a',
        fontsize=8, subfontsize=6.5)

for i in range(len(iot_items)-1):
    x1 = iot_items[i][0] + iot_items[i][2]
    x2 = iot_items[i+1][0]
    cy = iot_items[i][1] + iot_items[i][3]/2
    arrow(ax, x1, cy, x2, cy, color='#4ade80', lw=1.2)

# ══════════════════════════════════════════════════════════════════════════
# VERTICAL ARROWS (cross-layer flow)
# ══════════════════════════════════════════════════════════════════════════
# User → Frontend
arrow(ax, 2.2, 13.55, 2.2, 13.0, color='#3b82f6', lw=1.5)
arrow(ax, 5.4, 13.55, 5.4, 13.0, color='#3b82f6', lw=1.5)
arrow(ax, 8.6, 13.55, 8.6, 13.0, color='#22c55e', lw=1.5)
# Frontend → API Gateway
arrow(ax, 4.5, 11.8, 4.5, 10.4, color='#22c55e', lw=1.5)
arrow(ax, 11.0, 11.8, 11.0, 10.4, color='#22c55e', lw=1.5)
# API → AI
arrow(ax, 5.0, 8.35, 5.0, 7.1, color='#a78bfa', lw=1.5, label='Image Upload')
# API → DB
arrow(ax, 8.0, 8.35, 8.0, 4.35, color='#fbbf24', lw=1.5, label='ORM Queries')
# AI → DB
arrow(ax, 10.0, 5.1, 10.0, 4.35, color='#a78bfa', lw=1.5)
# IoT → DB
arrow(ax, 5.5, 1.6, 5.5, 2.3, color='#4ade80', lw=1.3)
# API → IoT Dashboard
arrow(ax, 14.0, 8.35, 11.35, 1.6, color='#16a34a', lw=1.3,
      connectionstyle='arc3,rad=-0.3')

# ══════════════════════════════════════════════════════════════════════════
# LEGEND
# ══════════════════════════════════════════════════════════════════════════
legend_items = [
    ('#3b82f6', 'User / Browser'),
    ('#22c55e', 'Frontend React'),
    ('#f97316', 'FastAPI Backend'),
    ('#a78bfa', 'AI / ML Engine'),
    ('#fbbf24', 'Database (SQLite)'),
    ('#16a34a', 'IoT Monitoring'),
]
lx, ly = 16.8, 7.5
ax.text(lx, ly + 0.9, 'Legend', color='#86efac', fontsize=8,
        fontweight='bold', ha='left', zorder=6)
for i, (clr, lbl) in enumerate(legend_items):
    ry = ly + 0.55 - i * 0.38
    rect = FancyBboxPatch((lx, ry - 0.13), 0.45, 0.28,
                           boxstyle='round,pad=0,rounding_size=0.06',
                           facecolor=clr, edgecolor='none', zorder=6)
    ax.add_patch(rect)
    ax.text(lx + 0.6, ry + 0.01, lbl, color=C_WHITE, fontsize=7.5,
            va='center', zorder=6)

# Version stamp
ax.text(21.5, 0.25, 'Smart E-Waste v1.0  ·  FastAPI + React + YOLOv8 + SQLite + IoT',
        ha='right', va='center', fontsize=6.5, color='#4b5563', zorder=5)

plt.tight_layout(pad=0)
out = r'C:\Users\Asus\.gemini\antigravity\scratch\smart-ewaste-system\architecture_diagram.png'
plt.savefig(out, dpi=150, bbox_inches='tight', facecolor=C_BG)
print(f"Saved: {out}")
plt.close()
