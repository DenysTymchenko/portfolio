"""Rebuild the diorama + panda, export both to public/models, then save diorama.blend."""

import importlib
import math
import sys

import bpy

SCRIPTS = "/Users/denys/Documents/portfolio/blender/scripts"
OUT = "/Users/denys/Documents/portfolio/public/models"
BLEND = "/Users/denys/Documents/portfolio/blender/diorama.blend"
sys.path.insert(0, SCRIPTS)
import toybox
importlib.reload(toybox)

exec(open(f"{SCRIPTS}/build_diorama.py").read())
exec(open(f"{SCRIPTS}/build_panda.py").read())

toybox.export_glb(bpy.data.collections["Diorama"], f"{OUT}/diorama.glb")
toybox.export_glb(bpy.data.collections["Panda"], f"{OUT}/panda.glb")
bpy.data.objects["Panda"].location = (-3.0, 0.2, FLOOR + 0.02)  # preview spot in Blender only

# Sunny preview lighting in Blender (the web app sets up its own lights).
sun = bpy.data.objects.get("Preview_Sun")
if sun:
    sun.data.energy = 4.0
    sun.data.color = (1.0, 0.96, 0.9)
    sun.rotation_euler = (math.radians(50), 0, math.radians(30))
world = bpy.context.scene.world
bg = next((n for n in world.node_tree.nodes if n.type == "BACKGROUND"), None) if world and world.node_tree else None
if bg:
    bg.inputs[0].default_value = toybox.srgb("#BFE6FF")
    bg.inputs[1].default_value = 1.2
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("exported diorama.glb + panda.glb")
