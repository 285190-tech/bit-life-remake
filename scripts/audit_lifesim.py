#!/usr/bin/env python3
"""Inventory static references to Life-Simulator1 constants; no upstream checkout is bundled."""
import argparse
import ast
from collections import defaultdict
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('checkout', type=Path, help='Path to a Life-Simulator1 checkout')
args = parser.parse_args()
root = args.checkout / 'src'
constants_file = root / 'lifesim_lib' / 'const.py'
if not constants_file.is_file():
    parser.error('checkout must contain src/lifesim_lib/const.py')

module = ast.parse(constants_file.read_text(encoding='utf-8'), filename=str(constants_file))
names = set()
for node in module.body:
    targets = node.targets if isinstance(node, ast.Assign) else [node.target] if isinstance(node, ast.AnnAssign) else []
    names.update(target.id for target in targets if isinstance(target, ast.Name) and target.id.isupper())

references = defaultdict(set)
for path in sorted(root.rglob('*.py')):
    if path == constants_file:
        continue
    tree = ast.parse(path.read_text(encoding='utf-8'), filename=str(path))
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load) and node.id in names:
            references[node.id].add(str(path.relative_to(root)))

print(f'{len(names)} distinct top-level uppercase names; {len(references)} referenced by name in other src files; {len(names - references.keys())} not referenced by name.')
print('This is a static name scan, not a reachability analysis; dynamic lookups or code outside src are not included.')
for name, paths in sorted(references.items()):
    print(f'{name}: {", ".join(sorted(paths))}')
