"""Tiny helpers for building chunky, bevelled "toy" props from code.

Every prop is a Shape: a bag of primitives (boxes, cylinders, spheres), each with its
own material and bevel, merged into one mesh. Pivot sets the object's origin, which
matters for parts that rotate (panda limbs, turntable platter).
"""

import math

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector


def srgb(hex_color):
    """'#RRGGBB' -> linear RGBA, which is what Blender's color sockets expect."""
    hex_color = hex_color.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


def material(name, hex_color, roughness=0.75, emission=None, strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    if not mat.node_tree:
        mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    inputs = {s.identifier: s for s in bsdf.inputs}
    inputs["Base Color"].default_value = srgb(hex_color)
    inputs["Roughness"].default_value = roughness
    if emission:
        inputs["Emission Color"].default_value = srgb(emission)
        inputs["Emission Strength"].default_value = strength
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

    def _add(self, build, mat, bevel, segments, smooth):
        tmp = bmesh.new()
        build(tmp)
        if bevel > 0:
            edges = [e for e in tmp.edges if e.calc_face_angle(0) > math.radians(40)]
            if edges:
                bmesh.ops.bevel(tmp, geom=edges, offset=bevel, offset_type="OFFSET",
                                segments=segments, profile=0.5, affect="EDGES", clamp_overlap=True)
        # Assign after bevelling: new bevel faces otherwise default to material 0.
        if mat not in self.mats:
            self.mats.append(mat)
        index = self.mats.index(mat)
        for f in tmp.faces:
            f.material_index = index
            f.smooth = smooth
        for e in tmp.edges:
            e.smooth = e.calc_face_angle(0) < math.radians(50)
        mesh = bpy.data.meshes.new("_toybox_tmp")
        tmp.to_mesh(mesh)
        tmp.free()
        self.bm.from_mesh(mesh)
        bpy.data.meshes.remove(mesh)
        return self

    def box(self, x0, x1, y0, y1, z0, z1, mat, bevel=0.02, segments=2, smooth=True):
        """Axis-aligned box from min/max bounds."""
        size = (x1 - x0, y1 - y0, z1 - z0)
        center = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        return self.boxc(center, size, mat, bevel=bevel, segments=segments, smooth=smooth)

    def boxc(self, center, size, mat, rot=None, bevel=0.02, segments=2, smooth=True):
        """Box from center + size, optionally rotated (Euler radians)."""
        m = Matrix.Translation(center) @ _rotation(rot) @ Matrix.Diagonal((*size, 1))
        bevel = min(bevel, 0.45 * min(size))
        return self._add(lambda bm: bmesh.ops.create_cube(bm, size=1.0, matrix=m),
                         mat, bevel, segments, smooth)

    def cyl(self, center, radius, depth, mat, rot=None, axis=None, radius2=None, verts=24,
            scale=(1, 1, 1), bevel=0.015, segments=2, smooth=True):
        """Cylinder (or cone with radius2) along local Z, centered on `center`."""
        m = Matrix.Translation(center) @ _rotation(rot, axis) @ Matrix.Diagonal((*scale, 1))
        r2 = radius if radius2 is None else radius2
        bevel = min(bevel, 0.45 * depth, 0.45 * max(radius, r2))
        return self._add(lambda bm: bmesh.ops.create_cone(
            bm, cap_ends=True, cap_tris=False, segments=verts, radius1=radius, radius2=r2,
            depth=depth, matrix=m), mat, bevel, segments, smooth)

    def sphere(self, center, radius, mat, scale=(1, 1, 1), subdiv=2, smooth=False):
        """Icosphere; flat-shaded by default for the faceted toy look."""
        m = Matrix.Translation(center) @ Matrix.Diagonal((*scale, 1))
        return self._add(lambda bm: bmesh.ops.create_icosphere(
            bm, subdivisions=subdiv, radius=radius, matrix=m), mat, 0, 0, smooth)

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
    """Named marker the web app looks up (spots, camera focus points, anchors)."""
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
