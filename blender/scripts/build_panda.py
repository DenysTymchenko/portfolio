"""Red panda in a t-shirt, after reference/panda-concept.webp: chunky faceted head,
white tee, dark brown limbs, striped tail. ~1 m tall, faces -Y (front view).

Built from rigid parts, each with its origin at the joint it swings around, so the web
app can animate it procedurally (no skinning needed): Panda_Body, Panda_Head,
Panda_ArmL/R, Panda_LegL/R, Panda_Tail, all children of the Panda empty.
"""

import importlib
import math
import sys

sys.path.insert(0, "/Users/denys/Documents/portfolio/blender/scripts")
import toybox
importlib.reload(toybox)
from toybox import Shape, empty, fresh_collection, material

col = fresh_collection("Panda")

FUR = material("Panda_Fur", "#D9622B", roughness=0.85)
CREAM = material("Panda_Cream", "#F6E3C8", roughness=0.85)
DARK = material("Panda_Dark", "#4A2318", roughness=0.85)
STRIPE = material("Panda_Stripe", "#8E3A1C", roughness=0.85)
SHIRT = material("Panda_Shirt", "#F7F0E8", roughness=0.9)
EYE = material("Panda_Eye", "#1C100C", roughness=0.25)
MOUTH = material("Panda_Mouth", "#E46F6A", roughness=0.6)

root = empty("Panda", (0, 0, 0), col, size=0.3)

HIP = 0.32
SHOULDER = 0.6
NECK = 0.64

# Legs: origin at the hip so they swing forward/back around X.
for side, name in ((1, "Panda_LegL"), (-1, "Panda_LegR")):
    x = 0.1 * side
    leg = Shape()
    leg.box(x - 0.085, x + 0.085, -0.08, 0.08, 0.06, HIP + 0.02, DARK, bevel=0.035)
    leg.box(x - 0.095, x + 0.095, -0.13, 0.08, 0.0, 0.09, DARK, bevel=0.035)
    leg.box(x - 0.06, x + 0.06, -0.135, -0.125, 0.02, 0.06, FUR, bevel=0.005)
    leg.build(name, col, pivot=(x, 0, HIP), parent=root)

body = Shape()
body.box(-0.2, 0.2, -0.13, 0.13, HIP - 0.06, HIP + 0.08, DARK, bevel=0.05)
body.box(-0.225, 0.225, -0.15, 0.15, HIP - 0.02, SHOULDER + 0.05, SHIRT, bevel=0.06)
body.box(-0.09, 0.09, -0.16, 0.14, SHOULDER + 0.03, SHOULDER + 0.065, DARK, bevel=0.01)
body.build("Panda_Body", col, pivot=(0, 0, HIP), parent=root)

# Arms: origin at the shoulder; sleeve + forearm + paw.
for side, name in ((1, "Panda_ArmL"), (-1, "Panda_ArmR")):
    x = 0.265 * side
    arm = Shape()
    arm.box(x - 0.075, x + 0.075, -0.085, 0.085, SHOULDER - 0.13, SHOULDER + 0.04, SHIRT, bevel=0.04)
    arm.box(x - 0.055, x + 0.055, -0.06, 0.06, SHOULDER - 0.34, SHOULDER - 0.1, DARK, bevel=0.03)
    arm.box(x - 0.06, x + 0.06, -0.065, 0.065, SHOULDER - 0.38, SHOULDER - 0.28, DARK, bevel=0.035)
    arm.build(name, col, pivot=(x, 0, SHOULDER), parent=root)

# Head: big faceted block (single-segment bevel = chamfered facets like the concept).
head = Shape()
H0, H1 = NECK, NECK + 0.46
head.box(-0.31, 0.31, -0.25, 0.23, H0, H1, FUR, bevel=0.09, segments=1, smooth=False)
for tx, tz, s in ((0.0, H1 - 0.01, 0.07), (-0.07, H1 - 0.02, 0.055), (0.07, H1 - 0.03, 0.05)):
    head.cyl((tx, -0.08, tz + s * 0.5), s, s * 1.4, FUR, radius2=0.005, verts=4,
             rot=(0.4, 0, 0.6), bevel=0, smooth=False)
# cream face patches
head.box(-0.13, 0.13, -0.29, -0.2, H0 + 0.05, H0 + 0.2, CREAM, bevel=0.04, segments=1, smooth=False)
for side in (1, -1):
    cheek = sorted((side * 0.15, side * 0.28))
    brow = sorted((side * 0.08, side * 0.2))
    head.box(*cheek, -0.275, -0.2, H0 + 0.07, H0 + 0.2, CREAM, bevel=0.03, segments=1, smooth=False)
    head.box(*brow, -0.268, -0.22, H0 + 0.33, H0 + 0.37, CREAM, bevel=0.012, segments=1, smooth=False)
    head.box(side * 0.13 - 0.035, side * 0.13 + 0.035, -0.272, -0.24, H0 + 0.24, H0 + 0.31, EYE, bevel=0.015)
    head.boxc((side * 0.13 + 0.012, -0.274, H0 + 0.295), (0.016, 0.004, 0.016), SHIRT, bevel=0)
head.box(-0.04, 0.04, -0.305, -0.28, H0 + 0.15, H0 + 0.2, EYE, bevel=0.012)
head.box(-0.035, 0.035, -0.295, -0.285, H0 + 0.08, H0 + 0.12, MOUTH, bevel=0.008)
# ears: cream outer pyramid, dark inner
for side in (1, -1):
    tilt = (0.15, -0.35 * side, math.pi / 4)
    head.cyl((side * 0.23, -0.02, H1 + 0.06), 0.15, 0.2, CREAM, radius2=0.015, verts=4,
             rot=tilt, scale=(1, 0.55, 1), bevel=0, smooth=False)
    head.cyl((side * 0.225, -0.065, H1 + 0.05), 0.09, 0.13, DARK, radius2=0.01, verts=4,
             rot=tilt, scale=(1, 0.4, 1), bevel=0, smooth=False)
head.build("Panda_Head", col, pivot=(0, 0, NECK), parent=root)

# Tail: chunky striped segments curving back and up from the hips.
tail = Shape()
pts = [(0, 0.13, 0.36), (0, 0.27, 0.33), (0, 0.41, 0.36), (0, 0.53, 0.45), (0, 0.6, 0.58), (0, 0.62, 0.72)]
radii = [0.08, 0.12, 0.14, 0.14, 0.13, 0.1]
for i in range(len(pts) - 1):
    a, b = pts[i], pts[i + 1]
    mid = tuple((a[k] + b[k]) / 2 for k in range(3))
    axis = tuple(b[k] - a[k] for k in range(3))
    length = math.dist(a, b) + 0.02
    tail.cyl(mid, radii[i + 1], length, STRIPE if i % 2 else FUR, axis=axis, verts=8,
             bevel=0.03, smooth=False)
tail.build("Panda_Tail", col, pivot=pts[0], parent=root)

print("Panda parts:", [o.name for o in col.objects])
