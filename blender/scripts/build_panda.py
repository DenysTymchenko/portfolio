"""Red panda in a t-shirt, after reference/panda-concept.webp: chunky faceted head,
white tee, dark brown limbs, striped tail. ~1 m tall, faces -Y (front view).

Built from rigid parts, each with its origin at the joint it swings around, so the web
app can animate it procedurally (no skinning needed): Panda_Body, Panda_Head,
Panda_ArmL/R, Panda_LegL/R, Panda_Tail, all children of the Panda empty.
Same faceted low-poly style as the room (toybox.py): chamfered blocks, 8-sided limbs.
"""

import importlib
import math
import sys

sys.path.insert(0, "/Users/denys/Documents/portfolio/blender/scripts")
import toybox
importlib.reload(toybox)
from toybox import Shape, empty, fresh_collection, material

col = fresh_collection("Panda")
toybox.seed(3)

FUR = material("Panda_Fur", "#EC6B2D")
CREAM = material("Panda_Cream", "#FFF0DA")
DARK = material("Panda_Dark", "#5C2C1F")
STRIPE = material("Panda_Stripe", "#A9431F")
SHIRT = material("Panda_Shirt", "#FFF9F2")
EYE = material("Panda_Eye", "#2A1A16")
MOUTH = material("Panda_Mouth", "#F07A7A")

root = empty("Panda", (0, 0, 0), col, size=0.3)

HIP = 0.32
SHOULDER = 0.6
NECK = 0.64

# Legs: origin at the hip so they swing forward/back around X.
for side, name in ((1, "Panda_LegL"), (-1, "Panda_LegR")):
    x = 0.1 * side
    leg = Shape()
    leg.cyl((x, 0, (0.08 + HIP + 0.02) / 2), 0.085, HIP + 0.02 - 0.08, DARK, verts=8, r=0.2)
    leg.box(x - 0.1, x + 0.1, -0.14, 0.08, 0.0, 0.11, DARK, r=0.4, rmax=0.045)
    leg.blob((x, -0.14, 0.05), 0.04, FUR, scale=(1.3, 0.5, 0.9), jitter=0)  # toe pad
    leg.build(name, col, pivot=(x, 0, HIP), parent=root)

body = Shape()
body.cyl((0, 0, HIP + 0.01), 0.19, 0.16, DARK, verts=8, scale=(1, 0.75, 1), r=0.3)
body.cyl((0, 0, (HIP - 0.02 + SHOULDER + 0.05) / 2), 0.23, SHOULDER + 0.07 - HIP, SHIRT, verts=8,
         scale=(1, 0.7, 1), r=0.35, rmax=0.07)
body.cyl((0, -0.005, SHOULDER + 0.05), 0.09, 0.03, DARK, verts=8, scale=(1, 0.75, 1), r=0)  # neckline
body.build("Panda_Body", col, pivot=(0, 0, HIP), parent=root)

# Arms: origin at the shoulder; short sleeve + forearm + round paw.
for side, name in ((1, "Panda_ArmL"), (-1, "Panda_ArmR")):
    x = 0.26 * side
    arm = Shape()
    arm.cyl((x, 0, SHOULDER - 0.05), 0.085, 0.17, SHIRT, verts=8, r=0.35)
    arm.cyl((x, 0, SHOULDER - 0.22), 0.055, 0.26, DARK, verts=8, r=0)
    arm.blob((x, 0, SHOULDER - 0.36), 0.07, DARK, scale=(1, 1, 0.9), jitter=0.05)
    arm.build(name, col, pivot=(x, 0, SHOULDER), parent=root)

# Head: big faceted block (single-segment chamfer = the concept's flat facets).
head = Shape()
H0, H1 = NECK, NECK + 0.46
head.box(-0.31, 0.31, -0.25, 0.23, H0, H1, FUR, r=0.3, rmax=0.1)
for tx, tz, s in ((0.0, H1 - 0.01, 0.07), (-0.07, H1 - 0.02, 0.055), (0.07, H1 - 0.03, 0.05)):
    head.cyl((tx, -0.08, tz + s * 0.5), s, s * 1.4, FUR, radius2=0.005, verts=4, rot=(0.4, 0, 0.6), r=0)
# Face, as in the concept: one cream mask over the lower face (cheek to cheek) with a
# raised muzzle, cream brow spots, big round eyes with a highlight, open smile.
FRONT = -0.25
head.box(-0.29, 0.29, FRONT - 0.03, FRONT + 0.06, H0 + 0.03, H0 + 0.2, CREAM, r=0.35, rmax=0.05)
head.box(-0.13, 0.13, FRONT - 0.075, FRONT, H0 + 0.05, H0 + 0.2, CREAM, r=0.35, rmax=0.035)
for side in (1, -1):
    head.blob((side * 0.15, FRONT - 0.005, H0 + 0.36), 0.05, CREAM, scale=(1.3, 0.35, 0.55), jitter=0)
    head.blob((side * 0.13, FRONT - 0.012, H0 + 0.27), 0.05, EYE, scale=(0.85, 0.4, 1.05), subdiv=2, jitter=0)
    head.blob((side * 0.13 + 0.018, FRONT - 0.03, H0 + 0.29), 0.015, SHIRT, scale=(1, 0.5, 1), jitter=0)
head.cyl((0, FRONT - 0.082, H0 + 0.175), 0.045, 0.03, EYE, radius2=0.03, verts=3,
         rot=(math.pi / 2, math.pi, 0), r=0.2)  # nose, point down
head.box(-0.05, 0.05, FRONT - 0.08, FRONT - 0.06, H0 + 0.075, H0 + 0.13, DARK, r=0.3)  # mouth
head.box(-0.032, 0.032, FRONT - 0.083, FRONT - 0.075, H0 + 0.078, H0 + 0.105, MOUTH, r=0.3)  # tongue
# Ears: cream outer pyramid, dark inner, set wide and tipped outward.
for side in (1, -1):
    tilt = (0.1, -0.45 * side, math.pi / 4)
    head.cyl((side * 0.24, -0.01, H1 + 0.07), 0.17, 0.24, CREAM, radius2=0.015, verts=4,
             rot=tilt, scale=(1, 0.55, 1), r=0)
    head.cyl((side * 0.236, -0.06, H1 + 0.055), 0.105, 0.16, DARK, radius2=0.01, verts=4,
             rot=tilt, scale=(1, 0.4, 1), r=0)
head.build("Panda_Head", col, pivot=(0, 0, NECK), parent=root)

# Tail: chunky striped 8-sided segments curving back and up from the hips.
tail = Shape()
pts = [(0, 0.13, 0.36), (0, 0.26, 0.32), (0, 0.4, 0.33), (0, 0.53, 0.41), (0, 0.62, 0.53), (0, 0.66, 0.67), (0, 0.65, 0.8)]
radii = [0.08, 0.13, 0.16, 0.17, 0.165, 0.15, 0.11]
for i in range(len(pts) - 1):
    a, b = pts[i], pts[i + 1]
    mid = tuple((a[k] + b[k]) / 2 for k in range(3))
    axis = tuple(b[k] - a[k] for k in range(3))
    tail.cyl(mid, radii[i + 1], math.dist(a, b) + 0.02, STRIPE if i % 2 else FUR, axis=axis, verts=8, r=0.25)
tail.build("Panda_Tail", col, pivot=pts[0], parent=root)

print("Panda parts:", [o.name for o in col.objects])
