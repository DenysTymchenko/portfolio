"""Rebuild room + panda and export both to public/models, then save room.blend."""

import importlib
import sys

import bpy

SCRIPTS = "/Users/denys/Documents/portfolio/blender/scripts"
OUT = "/Users/denys/Documents/portfolio/public/models"
sys.path.insert(0, SCRIPTS)
import toybox
importlib.reload(toybox)

exec(open(f"{SCRIPTS}/build_room.py").read())
exec(open(f"{SCRIPTS}/build_panda.py").read())

toybox.export_glb(bpy.data.collections["Diorama"], f"{OUT}/room.glb")
toybox.export_glb(bpy.data.collections["Panda"], f"{OUT}/panda.glb")
bpy.data.objects["Panda"].location = (-3.0, 0.2, FLOOR + 0.02)  # preview spot in Blender only
bpy.ops.wm.save_mainfile()
print("exported room.glb + panda.glb")
