"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.flush = exports.done_with_blender = exports.import_from_format = exports.export_to_format = exports.delete_selection = exports.select_all = exports.startBlender = void 0;
var child_process_1 = require("child_process");
var util_1 = require("./util");
var blender;
function startBlender(path) {
    blender = child_process_1.exec(JSON.stringify(path) + " --python-console");
    blender.on('exit', function (e) {
        util_1.fatal('Blender exited with code %s', e);
    });
    blender.stdin.write("import bpy\n");
    blender.stdin.write("C = byp.context\n");
}
exports.startBlender = startBlender;
function select_all(action) {
    blender.stdin.write("bpy.ops.object.select_all(action='" + action + "')\n");
}
exports.select_all = select_all;
function delete_selection() {
    blender.stdin.write("bpy.ops.object.delete()\n");
}
exports.delete_selection = delete_selection;
function export_to_format(format, file) {
    if (format == 'dae')
        blender.stdin.write("bpy.ops.wm.collada_export(filepath=" + JSON.stringify(file) + ")\n");
    else if (['ply'].includes(format))
        blender.stdin.write("bpy.ops.export_mesh." + format + "(filepath=" + JSON.stringify(file) + ")\n");
    else if (['fbx', 'gltf', 'obj'].includes(format))
        blender.stdin.write("bpy.ops.export_scene." + format + "(filepath=" + JSON.stringify(file) + ")\n");
}
exports.export_to_format = export_to_format;
function import_from_format(format, file) {
    if (format == 'dae')
        blender.stdin.write("bpy.ops.wm.collada_import(filepath=" + JSON.stringify(file) + ")\n");
    else if (['ply'].includes(format))
        blender.stdin.write("bpy.ops.import_mesh." + format + "(filepath=" + JSON.stringify(file) + ")\n");
    else if (['fbx', 'gltf', 'obj'].includes(format))
        blender.stdin.write("bpy.ops.import_scene." + format + "(filepath=" + JSON.stringify(file) + ")\n");
}
exports.import_from_format = import_from_format;
function done_with_blender(bye) {
    if (bye)
        blender.stdin.write("import sys;sys.exit()");
    blender.stdin.end();
}
exports.done_with_blender = done_with_blender;
function flush() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) {
                    var id = Math.random().toString().slice(2);
                    blender.stdin.write("print('asdf' + '" + id + "')\n");
                    function done_check(x) {
                        if (x.toString().includes("asdf" + id)) {
                            res();
                        }
                    }
                    blender.stdout.on('data', done_check);
                })];
        });
    });
}
exports.flush = flush;
blender.stdout.pipe(process.stderr);
blender.stderr.pipe(process.stderr);
