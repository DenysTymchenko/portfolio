"""Diorama: cozy room (left) + apple garden (right) on a floating island.

Style: faceted low-poly toys (rules in toybox.py). Blender is Z-up, centered on the origin,
back wall at +Y, camera at -Y. Objects named Spot_* / Zone_* / Anchor_* are empties the web app
reads positions from — keep those names when changing the layout. Exported as diorama.glb.
Run from Blender:  exec(open(".../blender/scripts/build_diorama.py").read())
"""

import importlib
import math
import random
import sys
from collections import namedtuple

sys.path.insert(0, "/Users/denys/Documents/portfolio/blender/scripts")
import toybox
importlib.reload(toybox)
from toybox import Shape, empty, fresh_collection, material

col = fresh_collection("Diorama")
rnd = random.Random(7)
toybox.seed(7)

# --- Palette: sunny and warm, with a few cool accents so it never reads all-yellow ------
M = {
    "grass": material("Grass", "#8DCF5A"),
    "grass2": material("Grass_Dark", "#6FB848"),
    "earth": material("Earth", "#D08D58"),
    "rock": material("Rock", "#B4826A"),
    "rock2": material("Rock_Dark", "#946A57"),
    "floor": material("Floor_Wood", "#EDAD6C"),
    "floor2": material("Floor_Wood_Alt", "#E19D5B"),
    "wall": material("Wall", "#FFF4E3"),
    "trim": material("Trim", "#EE7650"),
    "wood": material("Wood_Light", "#F7C994"),
    "wood_dark": material("Wood_Dark", "#BE7C4E"),
    "cork": material("Cork", "#F4CF9C"),
    "rug": material("Rug_Coral", "#F2664A"),
    "rug2": material("Rug_Yellow", "#FFC94D"),
    "sofa": material("Sofa", "#F2664A"),
    "mustard": material("Fabric_Mustard", "#FFC24B"),
    "teal": material("Teal", "#45B5AA"),
    "cream": material("Cream", "#FFF1DC"),
    "charcoal": material("Charcoal", "#5D5266"),
    "laptop": material("Laptop", "#DCD7E6"),
    "screen": material("Screen", "#3B3552", emission="#3B3552", strength=0.6),
    # Summer evening: sunset in the window, every lamp on (strength > 1 is what the glow picks up).
    "glass": material("Window_Sky", "#FFB89A", emission="#FFA98A", strength=1.1),
    "shade": material("Lamp_Shade", "#FFE6AE", emission="#FFD58A", strength=2.2),
    "glow": material("Lamp_Bulb", "#FFF1C9", emission="#FFDC8F", strength=4.0),
    "vinyl": material("Vinyl", "#3B3552"),
    "curtain": material("Curtain", "#F2664A"),
    "leaf": material("Leaves", "#5DB548"),
    "leaf2": material("Leaves_Light", "#86D05A"),
    "leaf3": material("Leaves_Dark", "#479A3F"),
    "bark": material("Bark", "#A8693F"),
    "stone": material("Stone", "#EEDFC8"),
    "pot": material("Pot", "#E8784A"),
    "book": [material(f"Book_{i}", c) for i, c in enumerate(
        ["#F2664A", "#FFC24B", "#45B5AA", "#86D05A", "#F7A1B5", "#7FA7E8", "#FFF1DC"])],
    "flower": [material(f"Flower_{i}", c) for i, c in enumerate(["#FF7A8A", "#FFC24B", "#FFFFFF", "#B98CF0"])],
    "bulb": [material(f"Bulb_{i}", c, emission=c, strength=3.0) for i, c in enumerate(
        ["#FFE7A0", "#FF9C85", "#9FE3D8", "#FFF6D6"])],
}

FLOOR = 0.12    # room floor top
GRASS = 0.0     # island / garden top
WALL_H = 3.2    # wall top
ROOM_X1 = 1.0   # room / garden split (partition sits at x 1.0..1.25)
WX = -6.7       # inner face of the left wall
WY = 3.2        # inner face of the back wall

# --- Floating island ------------------------------------------------------------------
island = Shape()
island.box(-7.45, 7.45, -3.95, 3.95, GRASS - 0.14, GRASS, M["grass"], r=0.6, rmax=0.12)
island.box(-7.3, 7.3, -3.8, 3.8, -0.6, GRASS - 0.1, M["earth"], r=0.5, rmax=0.22)
for cx, cy, rx, ry, depth, rock in ((0, 0, 7.0, 3.5, 2.6, "rock"), (-3.8, 0.4, 3.4, 2.7, 2.0, "rock2"),
                                     (3.9, -0.5, 3.1, 2.6, 2.3, "rock2"), (0.6, 1.4, 2.6, 2.0, 3.0, "rock")):
    island.cyl((cx, cy, -0.5 - depth / 2), 0.14, depth, M[rock], radius2=1.0, verts=9,
               scale=(rx, ry, 1), r=0, jitter=0.07)
island.build("Island", col)

# --- Room floor: wide chunky planks on a raised platform ---------------------------------
floor = Shape()
floor.box(-7.0, ROOM_X1 + 0.25, -3.5, 3.5, GRASS - 0.05, FLOOR - 0.04, M["wood_dark"], r=0.3, rmax=0.04)
PLANK = 0.58
for row in range(int(7.0 / PLANK) + 1):
    y0 = -3.5 + row * PLANK
    y1 = min(y0 + PLANK - 0.025, 3.5)
    x = -7.0 - rnd.uniform(0, 1.6)
    while x < ROOM_X1 + 0.25:
        length = rnd.uniform(2.2, 3.4)
        x0, x1 = max(x, -7.0), min(x + length - 0.025, ROOM_X1 + 0.25)
        if x1 - x0 > 0.1 and y1 - y0 > 0.1:
            floor.box(x0, x1, y0, y1, FLOOR - 0.06, FLOOR, M["floor"] if rnd.random() < 0.55 else M["floor2"],
                      r=0.4, rmax=0.025)
        x += length
floor.build("Room_Floor", col)

# --- Walls: thick, with a chunky cap and baseboards ----------------------------------------
Shape().box(-7.0, WX, -3.5, 3.5, FLOOR - 0.06, WALL_H, M["wall"], r=0.1, rmax=0.03).build("Wall_Left", col)
Shape().box(WX, ROOM_X1 + 0.25, WY, 3.5, FLOOR - 0.06, WALL_H, M["wall"], r=0.1, rmax=0.03).build("Wall_Back", col)
trim = Shape()
trim.box(-7.1, WX + 0.08, -3.6, 3.6, WALL_H - 0.02, WALL_H + 0.18, M["trim"], r=0.35, rmax=0.07)
trim.box(WX + 0.08, ROOM_X1 + 0.35, WY - 0.08, 3.6, WALL_H - 0.02, WALL_H + 0.18, M["trim"], r=0.35, rmax=0.07)
trim.box(WX, WX + 0.06, -3.5, WY, FLOOR, FLOOR + 0.16, M["trim"], r=0.3, rmax=0.025)
trim.box(WX, ROOM_X1, WY - 0.06, WY, FLOOR, FLOOR + 0.16, M["trim"], r=0.3, rmax=0.025)
trim.build("Wall_Trim", col)

# Window: a sky pane set on the wall with a chunky frame, sill and cross bars.
WIN_X0, WIN_X1, WIN_Z0, WIN_Z1 = -5.15, -3.45, 1.3, 2.6
win = Shape()
win.box(WIN_X0, WIN_X1, WY - 0.03, WY - 0.005, WIN_Z0, WIN_Z1, M["glass"], r=0)
F = 0.1
for x0, x1, z0, z1 in ((WIN_X0 - F, WIN_X1 + F, WIN_Z1, WIN_Z1 + F), (WIN_X0 - F, WIN_X0, WIN_Z0, WIN_Z1),
                       (WIN_X1, WIN_X1 + F, WIN_Z0, WIN_Z1)):
    win.box(x0, x1, WY - 0.1, WY, z0, z1, M["wood"], r=0.35, rmax=0.03)
win.box((WIN_X0 + WIN_X1) / 2 - 0.035, (WIN_X0 + WIN_X1) / 2 + 0.035, WY - 0.08, WY, WIN_Z0, WIN_Z1, M["wood"], r=0.3)
win.box(WIN_X0, WIN_X1, WY - 0.08, WY, (WIN_Z0 + WIN_Z1) / 2 - 0.035, (WIN_Z0 + WIN_Z1) / 2 + 0.035, M["wood"], r=0.3)
win.box(WIN_X0 - 0.2, WIN_X1 + 0.2, WY - 0.22, WY, WIN_Z0 - 0.12, WIN_Z0 + 0.0, M["wood"], r=0.35, rmax=0.04)
for x, s in ((WIN_X0 + 0.2, 0.09), (WIN_X1 - 0.25, 0.11)):  # a cloud or two in the sunset
    win.blob((x + 0.15, WY - 0.04, WIN_Z1 - 0.3), s * 1.4, M["curtain"], scale=(1.6, 0.2, 0.8), jitter=0.1)
win.build("Window_Back", col)

cur = Shape()
rod_z = WIN_Z1 + 0.3
cur.cyl(((WIN_X0 + WIN_X1) / 2, WY - 0.16, rod_z), 0.035, WIN_X1 - WIN_X0 + 1.5, M["wood_dark"],
        rot=(0, math.pi / 2, 0), verts=6, r=0.2)
for x in (WIN_X0 - 0.75, WIN_X1 + 0.75):
    cur.blob((x, WY - 0.16, rod_z), 0.07, M["wood_dark"], jitter=0)
drape_h = rod_z - (WIN_Z0 - 0.35)
for x0 in (WIN_X0 - 0.62, WIN_X1 + 0.08):
    for k in range(3):
        cur.cyl((x0 + 0.1 + k * 0.17, WY - 0.15, rod_z - drape_h / 2), 0.125, drape_h, M["curtain"],
                radius2=0.1, verts=3, rot=(0, 0, -math.pi / 2 + (k % 2) * 0.4), r=0)
cur.build("Curtains", col)

# Partition: low sill + chunky posts + header beam; the door gap is y 0.3..1.5.
DOOR_Y0, DOOR_Y1 = 0.3, 1.5
part = Shape()
for y0, y1 in ((-0.6, DOOR_Y0), (DOOR_Y1, WY)):
    part.box(ROOM_X1, ROOM_X1 + 0.25, y0, y1, FLOOR - 0.06, 0.55, M["wall"], r=0.3, rmax=0.04)
    part.box(ROOM_X1 - 0.04, ROOM_X1 + 0.29, y0 - 0.04, y1, 0.55, 0.63, M["wood"], r=0.35, rmax=0.03)
for y in (-0.62, DOOR_Y0 - 0.16, DOOR_Y1, 2.35):
    part.box(ROOM_X1 + 0.02, ROOM_X1 + 0.23, y, y + 0.16, FLOOR, 2.95, M["wood"], r=0.3, rmax=0.04)
part.box(ROOM_X1 - 0.02, ROOM_X1 + 0.27, -0.66, WY, 2.95, WALL_H, M["wood"], r=0.35, rmax=0.05)
part.build("Wall_Partition", col)

# --- POI 1: desk + laptop under the window ----------------------------------------------
DX, DY, DTOP = -4.3, 2.82, FLOOR + 0.72
desk = Shape()
desk.box(DX - 0.88, DX + 0.88, DY - 0.38, DY + 0.36, DTOP - 0.08, DTOP, M["wood"], r=0.35, rmax=0.035)
for lx in (DX - 0.78, DX + 0.78):
    for ly in (DY - 0.28, DY + 0.26):
        desk.frustum((lx, ly, (FLOOR + DTOP - 0.08) / 2), 0.07, 0.07, DTOP - 0.08 - FLOOR, M["wood_dark"], top=1.35)
desk.box(DX + 0.3, DX + 0.8, DY - 0.32, DY + 0.3, DTOP - 0.32, DTOP - 0.08, M["wood"], r=0.3, rmax=0.03)
desk.blob((DX + 0.55, DY - 0.33, DTOP - 0.2), 0.03, M["teal"], jitter=0)
desk.build("Desk", col)

LAP_Z = DTOP
TILT = math.radians(-15)
hinge_y = DY + 0.12
normal = (0, -math.cos(TILT), -math.sin(TILT))       # screen faces the chair
up = (0, -math.sin(TILT), math.cos(TILT))            # along the screen, hinge -> top
sc = (DX, hinge_y + up[1] * 0.13, LAP_Z + 0.03 + up[2] * 0.13)
laptop = Shape()
laptop.boxc((DX, DY, LAP_Z + 0.015), (0.4, 0.28, 0.03), M["laptop"], r=0.35, rmax=0.012)
laptop.boxc(sc, (0.4, 0.02, 0.26), M["laptop"], rot=(TILT, 0, 0), r=0.35, rmax=0.008)
laptop.build("Laptop", col)
disp = (sc[0], sc[1] + normal[1] * 0.011, sc[2] + normal[2] * 0.011)
Shape().boxc(disp, (0.35, 0.002, 0.22), M["screen"], rot=(TILT, 0, 0), r=0).build("Laptop_Display", col)
empty("Anchor_LaptopScreen", (disp[0], disp[1] + normal[1] * 0.003, disp[2] + normal[2] * 0.003),
      col, rot=(TILT, 0, 0), size=0.1)  # local -Y = screen normal -> +Z in three.js

lamp = Shape()
LX, LY = DX - 0.62, DY + 0.12
lamp.cyl((LX, LY, LAP_Z + 0.025), 0.1, 0.05, M["teal"], verts=8, r=0.3)
lamp.cyl((LX, LY, LAP_Z + 0.22), 0.025, 0.36, M["teal"], verts=6, r=0)
lamp.cyl((LX + 0.05, LY - 0.05, LAP_Z + 0.42), 0.15, 0.16, M["mustard"], radius2=0.06, verts=8,
         rot=(0.35, 0.35, 0), r=0.2)
lamp.blob((LX + 0.08, LY - 0.08, LAP_Z + 0.35), 0.06, M["glow"], jitter=0)
lamp.build("Desk_Lamp", col)
mug = Shape()
mug.cyl((DX + 0.52, DY - 0.12, LAP_Z + 0.055), 0.05, 0.11, M["rug"], verts=8, r=0.2)
mug.boxc((DX + 0.585, DY - 0.12, LAP_Z + 0.06), (0.03, 0.02, 0.06), M["rug"], r=0.3)
mug.build("Mug", col)

CX, CY = DX, DY - 0.75
chair = Shape()
chair.box(CX - 0.28, CX + 0.28, CY - 0.26, CY + 0.26, FLOOR + 0.4, FLOOR + 0.5, M["mustard"], r=0.45, rmax=0.05)
chair.box(CX - 0.26, CX + 0.26, CY - 0.33, CY - 0.2, FLOOR + 0.5, FLOOR + 1.05, M["mustard"], r=0.45, rmax=0.06)
chair.cyl((CX, CY, FLOOR + 0.24), 0.045, 0.32, M["charcoal"], verts=6, r=0)
chair.cyl((CX, CY, FLOOR + 0.04), 0.27, 0.07, M["charcoal"], verts=8, r=0.4)
chair.build("Chair", col)

# --- POI 2: vinyl cabinet + turntable + speakers -----------------------------------------
VX0, VX1, VY0, VY1, VTOP = -1.9, -0.1, 2.74, WY, FLOOR + 0.85
T = 0.05
shelf_mid = (FLOOR + VTOP) / 2 + 0.03
cab = Shape()
for z0, z1 in ((VTOP - T, VTOP), (FLOOR + 0.06, FLOOR + 0.06 + T), (shelf_mid - T / 2, shelf_mid + T / 2)):
    cab.box(VX0, VX1, VY0, VY1, z0, z1, M["wood"], r=0.4, rmax=0.025)
cell_w = (VX1 - VX0 - 5 * T) / 4
for i in range(5):
    x = VX0 + i * (cell_w + T)
    cab.box(x, x + T, VY0, VY1, FLOOR + 0.06, VTOP, M["wood"], r=0.4, rmax=0.02)
cab.box(VX0, VX1, VY1 - 0.03, VY1, FLOOR + 0.06, VTOP, M["wood_dark"], r=0)
for x in (VX0 + 0.08, VX1 - 0.08):
    cab.frustum((x, VY0 + 0.08, FLOOR + 0.03), 0.07, 0.07, 0.06, M["wood_dark"], top=1.2)
cab.build("Vinyl_Cabinet", col)
for row, z in enumerate((FLOOR + 0.06 + T, shelf_mid + T / 2)):
    for i in range(4):
        x = VX0 + T + i * (cell_w + T) + cell_w / 2
        empty(f"Anchor_Cubby_{row * 4 + i}", (x, (VY0 + VY1) / 2, z), col, size=0.08)

TTX, TTY = -1.15, 2.97
tt = Shape()
tt.box(TTX - 0.27, TTX + 0.27, TTY - 0.2, TTY + 0.2, VTOP, VTOP + 0.09, M["wood_dark"], r=0.35, rmax=0.025)
tt.cyl((TTX + 0.19, TTY + 0.11, VTOP + 0.11), 0.03, 0.05, M["charcoal"], verts=6, r=0)
tt.boxc((TTX + 0.14, TTY, VTOP + 0.125), (0.02, 0.22, 0.02), M["cream"], rot=(0, 0, -0.35), r=0.3)
tt.blob((TTX + 0.19, TTY - 0.15, VTOP + 0.1), 0.025, M["rug"], jitter=0)
tt.build("Turntable", col)
platter = Shape()
platter.cyl((TTX - 0.05, TTY, VTOP + 0.1), 0.165, 0.025, M["charcoal"], verts=12, r=0.3)
platter.build("Turntable_Platter", col, pivot=(TTX - 0.05, TTY, VTOP + 0.1))
empty("Anchor_Platter", (TTX - 0.05, TTY, VTOP + 0.113), col, size=0.06)
for sx, name in ((VX0 + 0.15, "Speaker_L"), (VX1 - 0.15, "Speaker_R")):
    spk = Shape()
    spk.box(sx - 0.13, sx + 0.13, 2.84, 3.12, VTOP, VTOP + 0.4, M["wood_dark"], r=0.3, rmax=0.04)
    spk.cyl((sx, 2.835, VTOP + 0.27), 0.08, 0.03, M["charcoal"], verts=8, rot=(math.pi / 2, 0, 0), r=0.3)
    spk.cyl((sx, 2.835, VTOP + 0.11), 0.05, 0.03, M["charcoal"], verts=8, rot=(math.pi / 2, 0, 0), r=0.3)
    spk.build(name, col)

# "Now playing" board above the cabinet: the web app writes the project details on it.
PB_X0, PB_X1, PB_Z0, PB_Z1 = -2.05, 0.05, 1.45, 2.85
board = Shape()
board.box(PB_X0, PB_X1, WY - 0.08, WY, PB_Z0, PB_Z1, M["wood_dark"], r=0.35, rmax=0.04)
board.box(PB_X0 + 0.08, PB_X1 - 0.08, WY - 0.1, WY - 0.08, PB_Z0 + 0.08, PB_Z1 - 0.08, M["cork"], r=0)
for x, pin in ((PB_X0 + 0.18, "rug"), (PB_X1 - 0.18, "teal")):
    board.blob((x, WY - 0.11, PB_Z1 - 0.18), 0.03, M[pin], jitter=0)
board.build("Project_Board", col)
empty("Anchor_ProjectBoard", ((PB_X0 + PB_X1) / 2, WY - 0.104, (PB_Z0 + PB_Z1) / 2), col, size=0.2)

# --- Cozy filler -------------------------------------------------------------------------
bs = Shape()
BX0, BX1, BY0, BY1, BTOP = WX, WX + 0.42, 0.5, 2.1, FLOOR + 2.2
for y0, y1 in ((BY0, BY0 + 0.07), (BY1 - 0.07, BY1)):
    bs.box(BX0, BX1, y0, y1, FLOOR, BTOP, M["teal"], r=0.35, rmax=0.025)
for k in range(5):
    z = FLOOR + 0.06 + k * 0.52
    bs.box(BX0, BX1, BY0, BY1, z - 0.06, z, M["teal"], r=0.35, rmax=0.02)
    if k == 4:
        continue
    y = BY0 + 0.1
    while y < BY1 - 0.16:
        if rnd.random() < 0.15:  # a lying stack instead of standing books
            for j in range(3):
                bs.box(BX0 + 0.06, BX0 + 0.34, y, y + 0.26, z + j * 0.07, z + j * 0.07 + 0.065,
                       rnd.choice(M["book"]), r=0.3, rmax=0.015)
            y += 0.3
            continue
        w, h = rnd.uniform(0.07, 0.12), rnd.uniform(0.26, 0.4)
        bs.boxc((BX0 + 0.2, y + w / 2, z + h / 2), (0.28, w, h), rnd.choice(M["book"]), r=0.3, rmax=0.015)
        y += w + 0.01
bs.cyl((BX0 + 0.2, BY0 + 0.4, BTOP + 0.1), 0.1, 0.2, M["pot"], radius2=0.13, verts=8, r=0.2)
bs.blob((BX0 + 0.2, BY0 + 0.4, BTOP + 0.3), 0.16, M["leaf"], jitter=0.15)
bs.build("Bookshelf", col)

SX0, SX1, SY0, SY1 = WX, -5.75, -2.55, -0.45
sofa = Shape()
sofa.box(SX0, SX1, SY0, SY1, FLOOR + 0.1, FLOOR + 0.45, M["sofa"], r=0.35, rmax=0.1)
sofa.box(SX0, SX0 + 0.28, SY0, SY1, FLOOR + 0.4, FLOOR + 1.0, M["sofa"], r=0.4, rmax=0.1)
for y0, y1 in ((SY0, SY0 + 0.26), (SY1 - 0.26, SY1)):
    sofa.box(SX0, SX1, y0, y1, FLOOR + 0.4, FLOOR + 0.72, M["sofa"], r=0.45, rmax=0.1)
mid = (SY0 + SY1) / 2
for y0, y1 in ((SY0 + 0.27, mid - 0.01), (mid + 0.01, SY1 - 0.27)):
    sofa.box(SX0 + 0.28, SX1 - 0.02, y0, y1, FLOOR + 0.42, FLOOR + 0.56, M["mustard"], r=0.45, rmax=0.06)
sofa.boxc((SX0 + 0.38, SY1 - 0.55, FLOOR + 0.74), (0.14, 0.36, 0.34), M["teal"], rot=(0, -0.25, 0.15), r=0.45)
for x in (SX0 + 0.1, SX1 - 0.1):
    for y in (SY0 + 0.1, SY1 - 0.1):
        sofa.frustum((x, y, FLOOR + 0.05), 0.07, 0.07, 0.1, M["wood_dark"], top=1.3)
sofa.build("Sofa", col)

rug = Shape()
for radius, mat, z in ((1.7, "rug", 0.006), (1.38, "rug2", 0.01), (1.05, "rug", 0.014)):
    rug.cyl((-3.0, 0.2, FLOOR + z), radius, 0.012, M[mat], verts=12, r=0)
rug.build("Rug", col)

fl = Shape()
fl.cyl((-6.25, 0.1, FLOOR + 0.03), 0.18, 0.06, M["charcoal"], verts=8, r=0.3)
fl.cyl((-6.25, 0.1, FLOOR + 0.8), 0.028, 1.5, M["charcoal"], verts=6, r=0)
fl.cyl((-6.25, 0.1, FLOOR + 1.62), 0.27, 0.32, M["shade"], radius2=0.13, verts=8, r=0.2)
fl.build("Floor_Lamp", col)


def plant(name, x, y, z, s=1.0):
    p = Shape()
    p.cyl((x, y, z + 0.15 * s), 0.14 * s, 0.3 * s, M["pot"], radius2=0.18 * s, verts=8, r=0.2)
    p.blob((x, y, z + 0.5 * s), 0.26 * s, M["leaf"], scale=(1, 1, 1.15), jitter=0.15)
    p.blob((x + 0.14 * s, y - 0.06 * s, z + 0.7 * s), 0.17 * s, M["leaf2"], jitter=0.15)
    p.blob((x - 0.1 * s, y + 0.05 * s, z + 0.76 * s), 0.15 * s, M["leaf3"], jitter=0.15)
    p.build(name, col)


plant("Plant_Corner", -6.3, 2.8, FLOOR, 1.5)
plant("Plant_Sill", ROOM_X1 + 0.12, 2.0, 0.63, 0.55)
plant("Plant_Desk", DX - 0.32, DY + 0.18, LAP_Z, 0.35)

# Name + role are painted on the left wall by the web app (text faces +X, into the room).
empty("Anchor_NameWall", (WX + 0.005, -1.5, 2.25), col, rot=(0, 0, math.radians(90)), size=0.3)

NAP = (-0.6, -1.9)
nap = Shape()
nap.cyl((*NAP, FLOOR + 0.08), 0.5, 0.16, M["mustard"], verts=10, r=0.45, rmax=0.07)
nap.cyl((*NAP, FLOOR + 0.18), 0.36, 0.07, M["rug"], verts=10, r=0.4, rmax=0.03)
nap.build("Nap_Cushion", col)

lights = Shape()
for wall, (a, b) in (("back", (-6.5, 0.85)), ("left", (3.05, -3.3))):
    n = int(abs(b - a) / 0.34)
    for i in range(n + 1):
        t = i / n
        sag = math.sin(t * math.pi * 3) ** 2 * 0.14
        u = a + (b - a) * t
        pos = (u, WY - 0.05, WALL_H - 0.16 - sag) if wall == "back" else (WX + 0.05, u, WALL_H - 0.16 - sag)
        lights.blob(pos, 0.045, M["bulb"][i % 4], jitter=0)
lights.build("String_Lights", col)

# --- POI 3: garden with apple trees -------------------------------------------------------
deck = Shape()
for k in range(3):
    y0 = DOOR_Y0 - 0.15 + k * 0.5
    deck.box(ROOM_X1 + 0.25, ROOM_X1 + 1.05, y0, y0 + 0.47, GRASS, FLOOR, M["wood"], r=0.35, rmax=0.025)
deck.build("Garden_Deck", col)

stones = Shape()
for i, (x, y) in enumerate(((2.65, 0.85), (3.2, 0.55), (3.75, 0.35), (4.35, 0.25), (4.95, 0.05))):
    stones.blob((x, y, GRASS + 0.02), 0.22 + 0.03 * (i % 2), M["stone"], scale=(1.15, 0.9, 0.18), jitter=0.12)
stones.build("Garden_Path", col)

fence = Shape()


def picket(x, y):
    fence.boxc((x, y, GRASS + 0.38), (0.13, 0.07, 0.76), M["wood"], r=0.3, rmax=0.025)
    fence.cyl((x, y, GRASS + 0.83), 0.092, 0.14, M["wood"], radius2=0.0, verts=4, rot=(0, 0, math.pi / 4), r=0)


for x in [ROOM_X1 + 0.4 + 0.5 * i for i in range(12)]:
    picket(x, 3.36)
for y in [-3.4 + 0.5 * i for i in range(14)]:
    picket(6.86, y)
for z in (GRASS + 0.28, GRASS + 0.6):
    fence.box(ROOM_X1 + 0.25, 6.92, 3.29, 3.31, z, z + 0.09, M["wood_dark"], r=0.3, rmax=0.02)
    fence.box(6.79, 6.81, -3.5, 3.31, z, z + 0.09, M["wood_dark"], r=0.3, rmax=0.02)
fence.build("Fence", col)

# The apple trees. Each becomes Tree_N_Trunk + Tree_N_Canopy; the web app finds every
# Tree_N_Canopy, hangs apples (one per job) on them and shakes/fades them.
AppleTree = namedtuple("AppleTree", "x y canopy_radius")
APPLE_TREES = [AppleTree(3.1, 2.15, 1.15), AppleTree(5.55, 1.0, 1.25), AppleTree(3.6, -1.75, 1.05)]
for i, (x, y, r) in enumerate(APPLE_TREES, start=1):
    trunk = Shape()
    trunk.cyl((x, y, GRASS + 0.88), 0.2, 1.76, M["bark"], radius2=0.13, verts=6, r=0)
    trunk.cyl((x, y, GRASS + 0.07), 0.32, 0.14, M["bark"], radius2=0.2, verts=6, r=0)
    trunk.cyl((x + 0.24, y - 0.05, GRASS + 1.45), 0.07, 0.6, M["bark"], radius2=0.04, verts=5, axis=(0.7, -0.1, 1), r=0)
    trunk.build(f"Tree_{i}_Trunk", col)
    cz = GRASS + 1.75 + r * 0.6
    canopy = Shape()
    canopy.blob((x, y, cz), r, M["leaf"], scale=(1, 1, 0.88), subdiv=2, jitter=0.07)
    canopy.blob((x + r * 0.62, y - r * 0.15, cz - r * 0.22), r * 0.58, M["leaf2"], jitter=0.12)
    canopy.blob((x - r * 0.58, y + r * 0.2, cz - r * 0.12), r * 0.6, M["leaf3"], jitter=0.12)
    canopy.blob((x - r * 0.05, y - r * 0.3, cz + r * 0.5), r * 0.55, M["leaf2"], jitter=0.12)
    canopy.build(f"Tree_{i}_Canopy", col, pivot=(x, y, cz))

bushes = Shape()
for x, y, s in ((6.35, 2.85, 0.42), (5.85, 3.0, 0.3), (6.4, -2.9, 0.36), (1.75, 2.9, 0.34), (1.7, -3.0, 0.32)):
    bushes.blob((x, y, GRASS + s * 0.6), s, M["leaf2"], scale=(1.1, 1, 0.85), jitter=0.15)
    for k in range(3):
        a = k * 2.1 + x
        bushes.blob((x + math.cos(a) * s * 0.75, y + math.sin(a) * s * 0.75, GRASS + s * 1.0), 0.06,
                    M["flower"][k], jitter=0)
bushes.build("Bushes", col)

bench = Shape()
for k in range(2):
    bench.box(5.0, 6.2, -3.05 + k * 0.21, -2.86 + k * 0.21, GRASS + 0.38, GRASS + 0.46, M["wood"], r=0.35, rmax=0.025)
for x in (5.12, 6.08):
    bench.frustum((x, -2.85, GRASS + 0.19), 0.1, 0.36, 0.38, M["wood_dark"], top=0.85)
bench.build("Bench", col)

basket = Shape()
basket.cyl((4.4, -0.85, GRASS + 0.13), 0.2, 0.26, M["wood"], radius2=0.27, verts=8, r=0.15)
basket.cyl((4.4, -0.85, GRASS + 0.27), 0.28, 0.05, M["wood_dark"], verts=8, r=0.3)
basket.build("Apple_Basket", col)

# Noticeboard: the web app writes the selected job on it.
JB_X, JB_Y = 5.85, -1.3
jb = Shape()
for px in (JB_X - 0.74, JB_X + 0.74):
    jb.frustum((px, JB_Y + 0.01, (GRASS + 1.95) / 2), 0.12, 0.12, 1.95, M["wood_dark"], top=0.8)
jb.box(JB_X - 0.84, JB_X + 0.84, JB_Y - 0.04, JB_Y + 0.04, 0.6, 1.84, M["wood"], r=0.35, rmax=0.04)
for side in (1, -1):  # little gable roof
    jb.boxc((JB_X, JB_Y + side * 0.13, 2.02), (1.95, 0.32, 0.07), M["trim"], rot=(side * 0.45, 0, 0), r=0.35)
jb.build("Job_Board", col)
empty("Anchor_JobBoard", (JB_X, JB_Y - 0.045, 1.22), col, size=0.2)

lantern = Shape()
for lx, ly in ((1.75, -3.1), (6.45, 2.4)):
    lantern.frustum((lx, ly, GRASS + 0.62), 0.11, 0.11, 1.24, M["wood_dark"], top=0.75)
    lantern.box(lx - 0.14, lx + 0.14, ly - 0.14, ly + 0.14, GRASS + 1.24, GRASS + 1.29, M["charcoal"], r=0.3)
    lantern.box(lx - 0.1, lx + 0.1, ly - 0.1, ly + 0.1, GRASS + 1.29, GRASS + 1.52, M["glow"], r=0.25)
    lantern.cyl((lx, ly, GRASS + 1.6), 0.2, 0.16, M["charcoal"], radius2=0.0, verts=4, rot=(0, 0, math.pi / 4), r=0)
lantern.build("Garden_Lanterns", col)

flowers = Shape()
for x, y in [(1.6 + 0.35 * i, 3.05 + 0.08 * (i % 2)) for i in range(10)] + [(6.55, -2.2 + 0.4 * i) for i in range(5)]:
    if math.hypot(x - 1.75, y - 2.9) < 0.45 or math.hypot(x - 5.85, y - 3.0) < 0.45 or math.hypot(x - 6.35, y - 2.85) < 0.5:
        continue  # leave room for the bushes
    flowers.cyl((x, y, GRASS + 0.15), 0.018, 0.3, M["leaf3"], verts=4, r=0)
    flowers.blob((x, y, GRASS + 0.32), 0.07, rnd.choice(M["flower"]), jitter=0.1)
flowers.build("Flowers", col)

tufts = Shape()
for _ in range(40):
    x, y = rnd.uniform(1.5, 6.6), rnd.uniform(-3.5, 3.1)
    if any(math.hypot(x - tree.x, y - tree.y) < 0.5 for tree in APPLE_TREES) or abs(y - 0.6) < 0.6 and x < 5.3:
        continue  # keep trunks and the stepping-stone path clear
    for k in range(3):
        a = k * 2.1 + rnd.uniform(-0.3, 0.3)
        tufts.cyl((x + math.cos(a) * 0.06, y + math.sin(a) * 0.06, GRASS + 0.1), 0.05, 0.22,
                  M["grass2"], radius2=0.0, verts=3, rot=(math.cos(a) * 0.35, math.sin(a) * 0.35, a), r=0)
tufts.build("Grass_Tufts", col)

# --- Markers for the web app --------------------------------------------------------------
for name, loc in {
    "Spot_Rug": (-3.0, 0.2, FLOOR + 0.02),  # spawn
    "Spot_Desk": (-3.6, 2.15, FLOOR),  # beside the chair, where the panda stands up
    # Zone centres (sizes live in src/scene/zones/Zones.tsx).
    "Zone_Desk": (-3.6, 2.15, FLOOR),
    "Zone_Garden": ((ROOM_X1 + 0.3 + 7.0) / 2, 0.0, GRASS),
    "Spot_Chair": (CX, CY, FLOOR + 0.5),  # seat top; the panda sits here facing the desk
    "Zone_Vinyl": (-1.0, 2.1, FLOOR),
}.items():
    empty(name, loc, col, size=0.25)
# Where the web app puts warm point lights for the lamps.
for name, loc in {
    "Light_DeskLamp": (LX + 0.1, LY - 0.15, LAP_Z + 0.3),
    "Light_FloorLamp": (-6.15, 0.1, FLOOR + 1.45),
    "Light_Lantern_1": (1.75, -3.1, GRASS + 1.4),
    "Light_Lantern_2": (6.45, 2.4, GRASS + 1.4),
}.items():
    empty(name, loc, col, size=0.1)
# Floor-painted hints (text lies flat, reading towards the back wall).
empty("Anchor_HintRoom", (-3.3, -2.75, FLOOR + 0.004), col, rot=(math.radians(-90), 0, 0), size=0.3)
empty("Anchor_HintGarden", (3.3, -2.95, GRASS + 0.004), col, rot=(math.radians(-90), 0, 0), size=0.3)

print("Diorama objects:", len(col.objects))
