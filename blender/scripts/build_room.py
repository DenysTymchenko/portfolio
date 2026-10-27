"""Grey-box diorama: cozy room (left) + apple garden (right) on one floating base.

Blender is Z-up; the base is centered on the origin, back wall at +Y, camera at -Y.
Objects named Spot_* / Focus_* / Anchor_* are empties the web app reads positions from.
Run from Blender:  exec(open(".../blender/scripts/build_room.py").read())
"""

import math
import random
import sys
import importlib

sys.path.insert(0, "/Users/denys/Documents/portfolio/blender/scripts")
import toybox
importlib.reload(toybox)
from toybox import Shape, empty, fresh_collection, material

col = fresh_collection("Diorama")
rnd = random.Random(7)

# --- Palette: warm, cozy yellows and reds --------------------------------------------
M = {
    "base": material("Base", "#EBD3AE"),
    "floor": material("Floor_Wood", "#B9683A"),
    "wall": material("Wall", "#F3E2C0"),
    "trim": material("Trim", "#8A3E22"),
    "wood": material("Wood_Light", "#D49A5C"),
    "wood_dark": material("Wood_Dark", "#5E2F1D"),
    "grass": material("Grass", "#9AAE4A"),
    "soil": material("Soil", "#7A4528"),
    "leaf": material("Leaves", "#5F8F37"),
    "leaf2": material("Leaves_Light", "#7BA43F"),
    "bark": material("Bark", "#6B3B22"),
    "rug": material("Rug_Red", "#C2412B"),
    "rug2": material("Rug_Yellow", "#F0B144"),
    "fabric": material("Fabric_Orange", "#D9662F"),
    "mustard": material("Fabric_Mustard", "#E2A43A"),
    "metal": material("Metal_Dark", "#33292A", roughness=0.4),
    "laptop": material("Laptop", "#C9C2BA", roughness=0.35),
    "screen": material("Screen", "#1E1A22", emission="#FFE2A8", strength=1.5),
    "glass": material("Window_Glow", "#FFD98A", emission="#FFC765", strength=2.5),
    "lamp": material("Lamp_Glow", "#FFD27A", emission="#FFC24D", strength=4.0),
    "vinyl": material("Vinyl", "#151215", roughness=0.3),
    "stone": material("Stone", "#C9B79A"),
    "pot": material("Pot_Terracotta", "#C0603A"),
    "paint1": material("Paint_Sky", "#F6A85A"),
    "paint2": material("Paint_Hill", "#B4492E"),
    "book": [material(f"Book_{i}", c) for i, c in enumerate(
        ["#C2412B", "#E2A43A", "#8A3E22", "#F0D9A8", "#6E8F3A", "#D9662F", "#5E2F1D"])],
}

FLOOR = 0.10    # room floor top
GRASS = 0.08    # garden ground top
WALL_H = 3.3    # wall top
ROOM_X1 = 1.0   # room / garden split (partition wall sits at x 1.0..1.25)

# --- Base, floors ---------------------------------------------------------------------
Shape().box(-7.1, 7.1, -3.6, 3.6, -0.6, -0.05, M["base"], bevel=0.06).build("Base", col)
Shape().box(-7.0, ROOM_X1 + 0.25, -3.5, 3.5, -0.05, FLOOR, M["floor"], bevel=0.02).build("Room_Floor", col)
Shape().box(ROOM_X1 + 0.25, 7.0, -3.5, 3.5, -0.05, GRASS - 0.03, M["soil"], bevel=0.02) \
    .box(ROOM_X1 + 0.25, 7.0, -3.5, 3.5, GRASS - 0.03, GRASS, M["grass"], bevel=0.01) \
    .build("Garden_Ground", col)

# --- Walls (left + back with a window, partition is a glass-wall frame) -----------------
Shape().box(-7.0, -6.75, -3.5, 3.5, FLOOR, WALL_H, M["wall"], bevel=0).build("Wall_Left", col)

WIN_X0, WIN_X1, WIN_Z0, WIN_Z1 = -5.2, -3.4, 1.35, 2.65
back = Shape()
back.box(-6.75, ROOM_X1 + 0.25, 3.25, 3.5, FLOOR, WIN_Z0, M["wall"], bevel=0)
back.box(-6.75, ROOM_X1 + 0.25, 3.25, 3.5, WIN_Z1, WALL_H, M["wall"], bevel=0)
back.box(-6.75, WIN_X0, 3.25, 3.5, WIN_Z0, WIN_Z1, M["wall"], bevel=0)
back.box(WIN_X1, ROOM_X1 + 0.25, 3.25, 3.5, WIN_Z0, WIN_Z1, M["wall"], bevel=0)
back.build("Wall_Back", col)

window = Shape()
window.box(WIN_X0, WIN_X1, 3.36, 3.40, WIN_Z0, WIN_Z1, M["glass"], bevel=0)
for x0, x1 in ((WIN_X0 - 0.06, WIN_X0 + 0.02), (WIN_X1 - 0.02, WIN_X1 + 0.06), (-4.33, -4.27)):
    window.box(x0, x1, 3.2, 3.42, WIN_Z0 - 0.04, WIN_Z1 + 0.04, M["wood"], bevel=0.01)
for z0, z1 in ((WIN_Z1 - 0.02, WIN_Z1 + 0.06), (2.0, 2.04)):
    window.box(WIN_X0, WIN_X1, 3.2, 3.42, z0, z1, M["wood"], bevel=0.01)
window.box(WIN_X0 - 0.12, WIN_X1 + 0.12, 3.08, 3.42, WIN_Z0 - 0.07, WIN_Z0, M["wood"], bevel=0.015)
window.build("Window_Back", col)

# Partition: low sill + posts + header, door gap at y 0.3..1.5
DOOR_Y0, DOOR_Y1 = 0.3, 1.5
part = Shape()
part.box(ROOM_X1, ROOM_X1 + 0.25, -0.6, DOOR_Y0, FLOOR, 0.55, M["wall"], bevel=0.02)
part.box(ROOM_X1, ROOM_X1 + 0.25, DOOR_Y1, 3.25, FLOOR, 0.55, M["wall"], bevel=0.02)
for y in (-0.6, DOOR_Y0 - 0.12, DOOR_Y1, 2.35, 3.13):
    part.box(ROOM_X1 + 0.03, ROOM_X1 + 0.22, y, y + 0.12, FLOOR, 2.95, M["wood"], bevel=0.015)
part.box(ROOM_X1, ROOM_X1 + 0.25, -0.6, 3.25, 2.95, WALL_H, M["wood"], bevel=0.02)
part.build("Wall_Partition", col)

trim = Shape()
trim.box(-7.06, -6.69, -3.56, 3.56, WALL_H, WALL_H + 0.12, M["trim"], bevel=0.02)
trim.box(-6.69, ROOM_X1 + 0.31, 3.19, 3.56, WALL_H, WALL_H + 0.12, M["trim"], bevel=0.02)
trim.box(-6.75, -6.70, -3.5, 3.25, FLOOR, FLOOR + 0.12, M["trim"], bevel=0.01)
trim.box(-6.75, ROOM_X1, 3.20, 3.25, FLOOR, FLOOR + 0.12, M["trim"], bevel=0.01)
trim.build("Wall_Trim", col)

# --- POI 1: desk + laptop under the window --------------------------------------------
DX, DY, DTOP = -4.3, 2.88, FLOOR + 0.72
desk = Shape()
desk.box(DX - 0.85, DX + 0.85, DY - 0.36, DY + 0.34, DTOP - 0.05, DTOP, M["wood"], bevel=0.02)
for lx in (DX - 0.78, DX + 0.78):
    for ly in (DY - 0.29, DY + 0.27):
        desk.box(lx - 0.03, lx + 0.03, ly - 0.03, ly + 0.03, FLOOR, DTOP - 0.05, M["wood_dark"], bevel=0.01)
desk.box(DX + 0.32, DX + 0.74, DY - 0.3, DY + 0.28, DTOP - 0.25, DTOP - 0.05, M["wood"], bevel=0.015)
desk.box(DX + 0.48, DX + 0.58, DY - 0.32, DY - 0.29, DTOP - 0.16, DTOP - 0.13, M["wood_dark"], bevel=0.005)
desk.build("Desk", col)

LAP_Z = DTOP
TILT = math.radians(-15)
hinge_y = DY + 0.12
normal = (0, -math.cos(TILT), -math.sin(TILT))       # screen faces the chair
up = (0, -math.sin(TILT), math.cos(TILT))            # along the screen, hinge -> top
sc = (DX, hinge_y + up[1] * 0.125, LAP_Z + 0.02 + up[2] * 0.125)
laptop = Shape()
laptop.boxc((DX, DY, LAP_Z + 0.01), (0.38, 0.26, 0.02), M["laptop"], bevel=0.006)
laptop.boxc(sc, (0.38, 0.012, 0.25), M["laptop"], rot=(TILT, 0, 0), bevel=0.004)
laptop.build("Laptop", col)
disp = (sc[0], sc[1] + normal[1] * 0.007, sc[2] + normal[2] * 0.007)
Shape().boxc(disp, (0.35, 0.002, 0.22), M["screen"], rot=(TILT, 0, 0), bevel=0) \
    .build("Laptop_Display", col)
empty("Anchor_LaptopScreen", (disp[0], disp[1] + normal[1] * 0.003, disp[2] + normal[2] * 0.003),
      col, rot=(TILT, 0, 0), size=0.1)  # local -Y = screen normal -> +Z in three.js

lamp = Shape()
lamp.cyl((DX - 0.65, DY + 0.12, LAP_Z + 0.015), 0.08, 0.03, M["metal"])
lamp.cyl((DX - 0.65, DY + 0.12, LAP_Z + 0.22), 0.012, 0.4, M["metal"])
lamp.cyl((DX - 0.6, DY + 0.08, LAP_Z + 0.42), 0.14, 0.14, M["lamp"], radius2=0.05, rot=(0.3, 0.4, 0))
lamp.build("Desk_Lamp", col)
Shape().cyl((DX + 0.5, DY - 0.1, LAP_Z + 0.05), 0.04, 0.1, M["rug"]).build("Mug", col)

CX, CY = DX, DY - 0.75
chair = Shape()
chair.box(CX - 0.26, CX + 0.26, CY - 0.24, CY + 0.24, FLOOR + 0.42, FLOOR + 0.5, M["fabric"], bevel=0.035)
chair.box(CX - 0.24, CX + 0.24, CY - 0.3, CY - 0.22, FLOOR + 0.5, FLOOR + 1.02, M["fabric"], bevel=0.035)
chair.cyl((CX, CY, FLOOR + 0.27), 0.03, 0.3, M["metal"])
for a in range(5):
    ang = a * 2 * math.pi / 5
    chair.boxc((CX + math.cos(ang) * 0.13, CY + math.sin(ang) * 0.13, FLOOR + 0.06), (0.26, 0.04, 0.03),
               M["metal"], rot=(0, 0, ang), bevel=0.01)
chair.build("Chair", col)

# --- POI 2: vinyl cabinet + turntable + speakers --------------------------------------
VX0, VX1, VY0, VY1, VTOP = -1.9, -0.1, 2.78, 3.24, FLOOR + 0.85
T = 0.04
cab = Shape()
cab.box(VX0, VX1, VY0, VY1, VTOP - T, VTOP, M["wood"], bevel=0.01)
cab.box(VX0, VX1, VY0, VY1, FLOOR + 0.06, FLOOR + 0.06 + T, M["wood"], bevel=0.01)
cab.box(VX0, VX1, VY0, VY1, (FLOOR + VTOP) / 2 + 0.03 - T / 2, (FLOOR + VTOP) / 2 + 0.03 + T / 2, M["wood"], bevel=0.005)
cell_w = (VX1 - VX0 - 5 * T) / 4
for i in range(5):
    x = VX0 + i * (cell_w + T)
    cab.box(x, x + T, VY0, VY1, FLOOR + 0.06, VTOP, M["wood"], bevel=0.005)
cab.box(VX0, VX1, VY1 - 0.02, VY1, FLOOR + 0.06, VTOP, M["wood_dark"], bevel=0)
for x in (VX0 + 0.06, VX1 - 0.06):
    cab.box(x - 0.025, x + 0.025, VY0 + 0.03, VY0 + 0.08, FLOOR, FLOOR + 0.06, M["wood_dark"], bevel=0.005)
cab.build("Vinyl_Cabinet", col)

shelf_mid = (FLOOR + VTOP) / 2 + 0.03
for row, z in enumerate((FLOOR + 0.06 + T, shelf_mid + T / 2)):
    for i in range(4):
        x = VX0 + T + i * (cell_w + T) + cell_w / 2
        empty(f"Anchor_Cubby_{row * 4 + i}", (x, (VY0 + VY1) / 2, z), col, size=0.08)

TTX, TTY = -1.15, 3.0
tt = Shape()
tt.box(TTX - 0.26, TTX + 0.26, TTY - 0.19, TTY + 0.19, VTOP, VTOP + 0.08, M["wood_dark"], bevel=0.012)
tt.cyl((TTX + 0.18, TTY + 0.1, VTOP + 0.1), 0.025, 0.04, M["metal"])
tt.boxc((TTX + 0.13, TTY - 0.0, VTOP + 0.115), (0.015, 0.2, 0.012), M["laptop"], rot=(0, 0, -0.35), bevel=0.003)
tt.box(TTX + 0.15, TTX + 0.22, TTY - 0.16, TTY - 0.12, VTOP + 0.08, VTOP + 0.095, M["laptop"], bevel=0.003)
tt.build("Turntable", col)
platter = Shape()
platter.cyl((TTX - 0.05, TTY, VTOP + 0.09), 0.16, 0.02, M["metal"], bevel=0.004)
platter.build("Turntable_Platter", col, pivot=(TTX - 0.05, TTY, VTOP + 0.09))
empty("Anchor_Platter", (TTX - 0.05, TTY, VTOP + 0.102), col, size=0.06)

for sx in (VX0 + 0.14, VX1 - 0.14):
    spk = Shape()
    spk.box(sx - 0.12, sx + 0.12, 2.86, 3.14, VTOP, VTOP + 0.38, M["wood_dark"], bevel=0.015)
    spk.cyl((sx, 2.855, VTOP + 0.25), 0.07, 0.02, M["metal"], rot=(math.pi / 2, 0, 0))
    spk.cyl((sx, 2.855, VTOP + 0.1), 0.045, 0.02, M["metal"], rot=(math.pi / 2, 0, 0))
    spk.build("Speaker_L" if sx < TTX else "Speaker_R", col)

art = Shape()
for i, (x, z, w, h) in enumerate(((-1.55, 1.75, 0.42, 0.42), (-0.85, 1.85, 0.42, 0.42), (-1.2, 2.4, 0.42, 0.42))):
    art.box(x - w / 2, x + w / 2, 3.2, 3.25, z - h / 2, z + h / 2, M["wood_dark"], bevel=0.01)
    art.box(x - w / 2 + 0.04, x + w / 2 - 0.04, 3.19, 3.2, z - h / 2 + 0.04, z + h / 2 - 0.04,
            [M["rug"], M["rug2"], M["fabric"]][i], bevel=0)
    art.cyl((x, 3.185, z), 0.1, 0.01, M["vinyl"], rot=(math.pi / 2, 0, 0), bevel=0)
art.build("Wall_Records", col)

# --- Cozy filler: bookshelf, sofa, rug, lamp, plants, painting, nap cushion -----------
bs = Shape()
BX0, BX1, BY0, BY1, BTOP = -6.75, -6.37, 0.5, 2.1, FLOOR + 2.2
bs.box(BX0, BX1, BY0, BY0 + 0.05, FLOOR, BTOP, M["wood_dark"], bevel=0.01)
bs.box(BX0, BX1, BY1 - 0.05, BY1, FLOOR, BTOP, M["wood_dark"], bevel=0.01)
for k in range(5):
    z = FLOOR + 0.05 + k * 0.52
    bs.box(BX0, BX1, BY0, BY1, z - 0.03, z, M["wood_dark"], bevel=0.008)
    if k < 4:
        y = BY0 + 0.07
        while y < BY1 - 0.12:
            w = rnd.uniform(0.04, 0.08)
            h = rnd.uniform(0.26, 0.4)
            lean = rnd.random() < 0.08
            bs.boxc((BX0 + 0.18, y + w / 2, z + h / 2), (0.26, w, h), rnd.choice(M["book"]),
                    rot=(0.25 if lean else 0, 0, 0), bevel=0.006)
            y += w + rnd.uniform(0.003, 0.02)
            if rnd.random() < 0.1:
                y += 0.15
bs.build("Bookshelf", col)

SX0, SX1, SY0, SY1 = -6.72, -5.85, -2.5, -0.5
sofa = Shape()
sofa.box(SX0, SX1, SY0, SY1, FLOOR + 0.08, FLOOR + 0.42, M["fabric"], bevel=0.06)
sofa.box(SX0, SX0 + 0.22, SY0, SY1, FLOOR + 0.42, FLOOR + 0.95, M["fabric"], bevel=0.07)
for y0, y1 in ((SY0, SY0 + 0.2), (SY1 - 0.2, SY1)):
    sofa.box(SX0, SX1, y0, y1, FLOOR + 0.42, FLOOR + 0.66, M["fabric"], bevel=0.07)
sofa.box(SX0 + 0.22, SX1 - 0.02, SY0 + 0.21, (SY0 + SY1) / 2 - 0.01, FLOOR + 0.42, FLOOR + 0.52, M["mustard"], bevel=0.04)
sofa.box(SX0 + 0.22, SX1 - 0.02, (SY0 + SY1) / 2 + 0.01, SY1 - 0.21, FLOOR + 0.42, FLOOR + 0.52, M["mustard"], bevel=0.04)
sofa.boxc((SX0 + 0.33, SY1 - 0.45, FLOOR + 0.68), (0.12, 0.34, 0.32), M["rug"], rot=(0, -0.25, 0.15), bevel=0.05)
for x in (SX0 + 0.06, SX1 - 0.06):
    for y in (SY0 + 0.06, SY1 - 0.06):
        sofa.cyl((x, y, FLOOR + 0.04), 0.03, 0.08, M["wood_dark"])
sofa.build("Sofa", col)

rug = Shape()
rug.cyl((-3.0, 0.2, FLOOR + 0.006), 1.7, 0.012, M["rug"], verts=48, bevel=0.004)
rug.cyl((-3.0, 0.2, FLOOR + 0.008), 1.4, 0.012, M["rug2"], verts=48, bevel=0.004)
rug.cyl((-3.0, 0.2, FLOOR + 0.01), 1.1, 0.012, M["rug"], verts=48, bevel=0.004)
rug.build("Rug", col)

fl = Shape()
fl.cyl((-6.3, 0.05, FLOOR + 0.02), 0.16, 0.04, M["metal"])
fl.cyl((-6.3, 0.05, FLOOR + 0.8), 0.018, 1.56, M["metal"])
fl.cyl((-6.3, 0.05, FLOOR + 1.62), 0.26, 0.3, M["lamp"], radius2=0.12, verts=12)
fl.build("Floor_Lamp", col)

def plant(name, x, y, z, s=1.0):
    p = Shape()
    p.cyl((x, y, z + 0.15 * s), 0.17 * s, 0.3 * s, M["pot"], radius2=0.13 * s, verts=12)
    p.sphere((x, y, z + 0.48 * s), 0.25 * s, M["leaf"], scale=(1, 1, 1.2), subdiv=1)
    p.sphere((x + 0.12 * s, y - 0.06 * s, z + 0.66 * s), 0.17 * s, M["leaf2"], subdiv=1)
    p.sphere((x - 0.1 * s, y + 0.05 * s, z + 0.72 * s), 0.15 * s, M["leaf"], subdiv=1)
    p.build(name, col)

plant("Plant_Corner", -6.35, 2.85, FLOOR, 1.5)
plant("Plant_Sill", ROOM_X1 + 0.12, 2.0, 0.55, 0.55)
plant("Plant_Desk", DX - 0.35, DY + 0.18, LAP_Z, 0.35)

paint = Shape()
paint.box(-6.75, -6.71, -2.2, -0.8, 1.45, 2.35, M["wood_dark"], bevel=0.01)
paint.box(-6.71, -6.70, -2.12, -0.88, 1.53, 2.27, M["paint1"], bevel=0)
paint.box(-6.70, -6.69, -2.12, -0.88, 1.53, 1.8, M["paint2"], bevel=0)
paint.build("Painting", col)

Shape().cyl((-2.0, -2.4, FLOOR + 0.07), 0.48, 0.14, M["mustard"], verts=24, bevel=0.06) \
    .cyl((-2.0, -2.4, FLOOR + 0.16), 0.36, 0.06, M["fabric"], verts=24, bevel=0.03) \
    .build("Nap_Cushion", col)

# --- POI 3: garden with apple trees -----------------------------------------------------
deck = Shape()
deck.box(ROOM_X1 + 0.25, ROOM_X1 + 1.0, DOOR_Y0 - 0.2, DOOR_Y1 + 0.2, GRASS - 0.02, FLOOR, M["wood"], bevel=0.015)
deck.build("Garden_Deck", col)

stones = Shape()
for i, (x, y) in enumerate(((2.65, 0.85), (3.2, 0.55), (3.75, 0.35), (4.35, 0.25), (4.95, 0.05))):
    stones.cyl((x, y, GRASS), 0.2 + 0.03 * (i % 2), 0.04, M["stone"], verts=9, bevel=0.012)
stones.build("Garden_Path", col)

fence = Shape()
for x in [ROOM_X1 + 0.35 + 0.55 * i for i in range(11)]:
    fence.box(x - 0.04, x + 0.04, 3.32, 3.4, GRASS, GRASS + 0.85, M["wood"], bevel=0.012)
for y in [-3.4 + 0.6 * i for i in range(12)]:
    fence.box(6.82, 6.9, y - 0.04, y + 0.04, GRASS, GRASS + 0.85, M["wood"], bevel=0.012)
for z in (GRASS + 0.3, GRASS + 0.65):
    fence.box(ROOM_X1 + 0.25, 6.9, 3.34, 3.38, z, z + 0.07, M["wood"], bevel=0.01)
    fence.box(6.84, 6.88, -3.45, 3.4, z, z + 0.07, M["wood"], bevel=0.01)
fence.build("Fence", col)

TREES = [(3.1, 2.15, 1.15), (5.55, 1.0, 1.25), (3.6, -1.75, 1.05)]
for i, (x, y, r) in enumerate(TREES, start=1):
    trunk = Shape()
    trunk.cyl((x, y, GRASS + 0.85), 0.16, 1.7, M["bark"], radius2=0.11, verts=8, bevel=0.02)
    trunk.cyl((x + 0.25, y, GRASS + 1.45), 0.06, 0.6, M["bark"], axis=(0.6, 0, 1), verts=6, bevel=0.01)
    trunk.cyl((x, y, GRASS + 0.04), 0.3, 0.08, M["bark"], radius2=0.16, verts=8, bevel=0.01)
    trunk.build(f"Tree_{i}_Trunk", col)
    cz = GRASS + 1.7 + r * 0.6
    canopy = Shape()
    canopy.sphere((x, y, cz), r, M["leaf"], scale=(1, 1, 0.85), subdiv=2)
    canopy.sphere((x + r * 0.55, y - r * 0.2, cz - r * 0.2), r * 0.6, M["leaf2"], subdiv=1)
    canopy.sphere((x - r * 0.5, y + r * 0.25, cz - r * 0.1), r * 0.62, M["leaf2"], subdiv=1)
    canopy.sphere((x - r * 0.1, y - r * 0.3, cz + r * 0.45), r * 0.55, M["leaf"], subdiv=1)
    canopy.build(f"Tree_{i}_Canopy", col, pivot=(x, y, cz))

bushes = Shape()
for x, y, s in ((6.4, 2.9, 0.38), (5.9, 3.0, 0.3), (6.45, -2.9, 0.34), (1.7, 2.95, 0.32), (1.65, -3.0, 0.3)):
    bushes.sphere((x, y, GRASS + s * 0.7), s, M["leaf2"], scale=(1, 1, 0.8), subdiv=1)
    for k in range(3):
        a = k * 2.1
        bushes.sphere((x + math.cos(a) * s * 0.7, y + math.sin(a) * s * 0.7, GRASS + s * 1.1), 0.05,
                      [M["rug"], M["rug2"], M["fabric"]][k], subdiv=1)
bushes.build("Bushes", col)

bench = Shape()
bench.box(5.0, 6.2, -3.05, -2.65, GRASS + 0.4, GRASS + 0.47, M["wood"], bevel=0.015)
for x in (5.1, 6.1):
    bench.box(x - 0.04, x + 0.04, -3.0, -2.7, GRASS, GRASS + 0.4, M["wood_dark"], bevel=0.01)
bench.build("Bench", col)

basket = Shape()
basket.cyl((4.4, -0.85, GRASS + 0.12), 0.22, 0.24, M["wood"], radius2=0.26, verts=12, bevel=0.02)
basket.build("Apple_Basket", col)

# --- Markers for the web app ----------------------------------------------------------
SPOTS = {
    "Spot_Desk": (-3.6, 2.15, FLOOR),
    "Spot_Vinyl": (-2.25, 2.45, FLOOR),  # beside the cabinet, so it doesn't block the records
    "Spot_Rug": (-3.0, 0.2, FLOOR + 0.02),
    "Spot_Nap": (-2.0, -2.4, FLOOR + 0.2),
    "Spot_Sofa": (-5.3, -1.0, FLOOR),
    "Spot_DoorIn": (0.45, 0.9, FLOOR),
    "Spot_DoorOut": (2.0, 0.9, FLOOR),
    "Spot_Garden": (4.1, 0.2, GRASS),
}
for name, loc in SPOTS.items():
    empty(name, loc, col, size=0.25)
empty("Focus_Desk", (DX, DY + 0.05, LAP_Z + 0.15), col, size=0.2)
empty("Focus_Vinyl", (-1.0, 2.95, VTOP - 0.1), col, size=0.2)
empty("Focus_Garden", (4.3, 0.6, 1.9), col, size=0.2)
empty("Light_DeskLamp", (DX - 0.6, DY + 0.02, LAP_Z + 0.36), col, size=0.1)
empty("Light_FloorLamp", (-6.25, 0.05, FLOOR + 1.5), col, size=0.1)
empty("Light_Window", ((WIN_X0 + WIN_X1) / 2, 3.0, (WIN_Z0 + WIN_Z1) / 2), col, size=0.1)

print("Diorama objects:", len(col.objects))
