"""Helpers for building everything from code in one consistent style: faceted low-poly toys.

Style rules — keep every prop in this family so the scene reads as one world:
- flat shading and matte colors everywhere, nothing smooth or glossy;
- no sharp boxes: blocks get a single-segment chamfer sized to the block (`r` = fraction of the
  smallest side, capped by `rmax`); round things are 6-12 sided; organic things (leaves, rocks,
  cushions of foliage) are jittered low-res icospheres ("blobs");
- chunky proportions and few parts, no fiddly realistic detail.

Each prop is a Shape: a bag of primitives merged into one mesh. `pivot` sets the object's
origin, which matters for parts that move (panda limbs, turntable platter, tree canopies).
"""

import math
import random

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

_rnd = random.Random(1)
CHAMFER_ANGLE = math.radians(50)  # bevel only real corners, not the sides of 8+-gon cylinders


def seed(n):
    """Reset the jitter RNG so rebuilding gives the same shapes."""
    _rnd.seed(n)


def srgb(hex_color):
    """'#RRGGBB' -> linear RGBA, which is what Blender's color sockets expect."""
    hex_color = hex_color.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


def material(name, hex_color, emission=None, strength=0.0):
    """Matte material (roughness 1, no metal): the look is carried by flat colors and light."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    if not mat.node_tree:
        mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    inputs = {s.identifier: s for s in bsdf.inputs}
    inputs["Base Color"].default_value = srgb(hex_color)
    inputs["Roughness"].default_value = 1.0
    inputs["Metallic"].default_value = 0.0
    inputs["Emission Color"].default_value = srgb(emission or "#000000")
    inputs["Emission Strength"].default_value = strength if emission else 0.0
    mat.diffuse_color = srgb(hex_color)
    return mat


def fresh_collection(name):
    """Empty (or create) a collection so a build script can be re-run safely."""
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    for obj in list(col.objects):
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if isinstance(data, bpy.types.Mesh) and data.users == 0:
            bpy.data.meshes.remove(data)
    return col


def _rotation(rot=None, axis=None):
    if axis is not None:
        return Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized()).to_matrix().to_4x4()
    return Euler(rot or (0, 0, 0)).to_matrix().to_4x4()


class Shape:
    def __init__(self):
        self.bm = bmesh.new()
        self.mats = []

    def _add(self, build, mat, chamfer=0.0, jitter=0.0):
        tmp = bmesh.new()
        build(tmp)
        if jitter:
            center = sum((v.co for v in tmp.verts), Vector()) / len(tmp.verts)
            for v in tmp.verts:
                v.co = center + (v.co - center) * (1 + _rnd.uniform(-jitter, jitter))
        if chamfer > 0:
            edges = [e for e in tmp.edges if e.calc_face_angle(0) > CHAMFER_ANGLE]
            if edges:
                bmesh.ops.bevel(tmp, geom=edges, offset=chamfer, offset_type="OFFSET", segments=1,
                                profile=0.5, affect="EDGES", clamp_overlap=True)
        # Assign after bevelling: new bevel faces otherwise default to material 0.
        if mat not in self.mats:
            self.mats.append(mat)
        index = self.mats.index(mat)
        for f in tmp.faces:
            f.material_index = index
            f.smooth = False
        mesh = bpy.data.meshes.new("_toybox_tmp")
        tmp.to_mesh(mesh)
        tmp.free()
        self.bm.from_mesh(mesh)
        bpy.data.meshes.remove(mesh)
        return self

    def box(self, x0, x1, y0, y1, z0, z1, mat, r=0.25, rmax=0.12):
        """Chamfered block from min/max bounds."""
        size = (x1 - x0, y1 - y0, z1 - z0)
        center = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        return self.boxc(center, size, mat, r=r, rmax=rmax)

    def boxc(self, center, size, mat, rot=None, r=0.25, rmax=0.12):
        """Chamfered block from center + size, optionally rotated (Euler radians)."""
        m = Matrix.Translation(center) @ _rotation(rot) @ Matrix.Diagonal((*size, 1))
        return self._add(lambda bm: bmesh.ops.create_cube(bm, size=1.0, matrix=m),
                         mat, chamfer=min(r * min(size), rmax))

    def frustum(self, center, w, d, h, mat, top=0.75, rot=None, r=0.2, rmax=0.08):
        """Block whose top is scaled by `top` (tapered legs, pots, posts, roofs)."""
        m = (Matrix.Translation(center) @ _rotation(rot) @ Matrix.Diagonal((w, d, h, 1))
             @ Matrix.Rotation(math.pi / 4, 4, "Z"))
        half_diag = math.sqrt(0.5)
        return self._add(lambda bm: bmesh.ops.create_cone(
            bm, cap_ends=True, cap_tris=False, segments=4, radius1=half_diag, radius2=half_diag * top,
            depth=1.0, matrix=m), mat, chamfer=min(r * min(w, d, h), rmax))

    def cyl(self, center, radius, depth, mat, rot=None, axis=None, radius2=None, verts=8,
            scale=(1, 1, 1), r=0.25, rmax=0.06, jitter=0.0):
        """Low-sided cylinder (or cone with radius2) along local Z, centered on `center`."""
        m = Matrix.Translation(center) @ _rotation(rot, axis) @ Matrix.Diagonal((*scale, 1))
        r2 = radius if radius2 is None else radius2
        return self._add(lambda bm: bmesh.ops.create_cone(
            bm, cap_ends=True, cap_tris=False, segments=verts, radius1=radius, radius2=r2,
            depth=depth, matrix=m), mat, chamfer=min(r * min(depth, max(radius, r2)), rmax), jitter=jitter)

    def blob(self, center, radius, mat, scale=(1, 1, 1), subdiv=1, jitter=0.12):
        """Jittered low-res icosphere: foliage, rocks, clouds, round soft things."""
        m = Matrix.Translation(center) @ Matrix.Diagonal((*scale, 1))
        return self._add(lambda bm: bmesh.ops.create_icosphere(
            bm, subdivisions=subdiv, radius=radius, matrix=m), mat, jitter=jitter)

    def build(self, name, collection, pivot=(0, 0, 0), parent=None):
        pivot = Vector(pivot)
        bmesh.ops.translate(self.bm, verts=self.bm.verts[:], vec=-pivot)
        mesh = bpy.data.meshes.new(name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for mat in self.mats:
            mesh.materials.append(mat)
        obj = bpy.data.objects.new(name, mesh)
        collection.objects.link(obj)
        obj.location = pivot
        if parent is not None:
            obj.parent = parent
            obj.matrix_parent_inverse = parent.matrix_world.inverted()
        return obj


def empty(name, location, collection, rot=(0, 0, 0), size=0.15, parent=None):
    """Named marker the web app looks up (spots, zones, anchors)."""
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = size
    obj.location = location
    obj.rotation_euler = rot
    collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def export_glb(collection, filepath):
    """Export one collection to .glb (Y-up, modifiers applied, no lights/cameras)."""
    bpy.ops.object.select_all(action="DESELECT")
    for obj in collection.all_objects:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=filepath, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_lights=False,
                              export_cameras=False, export_extras=True)
    bpy.ops.object.select_all(action="DESELECT")
