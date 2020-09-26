import glob
import re
import os

class_map = {}

def scan_for_class_defs(pattern):
    for fn in glob.glob(pattern, recursive=True):
        with open(fn) as f:
            for l in f:
                m = re.match(r'export declare class (\w+).*', l)
                if m:
                    module_name = fn.replace('node_modules/', '').replace('.d.ts', '')
                    class_map[m.group(1)] = module_name
                    #print(module_name + ' ' + m.group(1))

scan_for_class_defs('node_modules/@babylonjs/**/*.d.ts')

print(class_map)

for fn in glob.glob('src/**/*.ts', recursive=True):
    babylon_deps = set()

    with open(fn) as f:
        for l in f:
            if 'import' in l: continue
            for m in re.finditer(r'\w+', l):
                if m.group(0) in class_map:
                    babylon_deps.add(m.group(0))

    with open(f'{fn}.tmp', 'w') as fw:
        with open(fn) as f:
            for dep in sorted(babylon_deps):
                fw.write(f'import {{ {dep} }} from "{class_map[dep]}";\n')

            for l in f:
                if 'import' in l and 'babylonjs' in l and '{' in l: continue

                fw.write(l)

    os.unlink(fn)
    os.rename(f'{fn}.tmp', fn)
