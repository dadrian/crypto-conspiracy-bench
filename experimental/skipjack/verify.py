"""Reproduce the posted generator and compare every byte to NIST's F-table."""

import hashlib
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent


def generate(seed):
    # POSIX srand48/drand48, expressed with exact integers. Since drand48
    # returns state / 2**48, floor(256 * drand48()) is state >> 40.
    state = ((seed & 0xffffffff) << 16) | 0x330e
    table = [-1] * 256
    k = draws = 0
    while k < 256:
        state = (0x5deece66d * state + 0xb) & ((1 << 48) - 1)
        draws += 1
        v = state >> 40
        if table[v] < 0:
            table[v] = k
            k += 1
    return table, draws


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def main():
    reference = list(bytes.fromhex((ROOT / 'f-table.hex').read_text()))
    require(sorted(reference) == list(range(256)), 'Reference is not a permutation')
    require(hashlib.sha256(bytes(reference)).hexdigest() ==
            '3587a8b7cde06e199ec29100dfe96c61ae1999de95308b8abc49d38f12565624',
            'Reference digest changed')
    generated, draws = generate(48571)
    require(sorted(generated) == list(range(256)), 'Generator is not a permutation')

    # Independent implementation: compile the posted C against native libc.
    # A temporary directory keeps the checkout free of compiled artifacts.
    with tempfile.TemporaryDirectory() as tmp:
        binary = str(Path(tmp) / 'generate')
        subprocess.run(['cc', '-std=c99', '-D_XOPEN_SOURCE=700', '-Wall',
                        '-Wextra', '-Werror', str(ROOT / 'generate.c'),
                        '-o', binary], check=True)
        native = list(bytes.fromhex(subprocess.check_output([binary], text=True)))
    require(native == generated, 'Native C and integer implementation disagree')

    mismatches = [i for i in range(256) if generated[i] != reference[i]]
    require(len(mismatches) == 83 and draws == 1399,
            'Observed generator result changed')
    print('Native C / integer implementation: 256/256 identical')
    print(f'Seed: 48571; PRNG draws: {draws}')
    print(f'Unmodified generator: {256 - len(mismatches)}/256 entries match')
    print('Index  Generated  Official (hex)')
    for i in mismatches:
        print(f'{i:02x}     {generated[i]:02x}         {reference[i]:02x}')

    # Deterministically derive a minimal sequence of entry swaps from the
    # reference. This reconstructs corrections; it does not explain their origin.
    corrected = generated.copy()
    swaps = []
    for i, expected in enumerate(reference):
        if corrected[i] != expected:
            j = corrected.index(expected)
            corrected[i], corrected[j] = corrected[j], corrected[i]
            swaps.append((i, j))
    require(corrected == reference, 'Corrected table differs from reference')
    require(len(swaps) == 52, 'Observed swap count changed')
    print('Derived entry swaps (hex indices): ' +
          ', '.join(f'({i:02x}, {j:02x})' for i, j in swaps))
    print('After swaps: 256/256 entries match')
    for label, table in [('Generated', generated), ('Official', reference)]:
        print(f'{label} bytes SHA-256: {hashlib.sha256(bytes(table)).hexdigest()}')

    # Nearby seeds are controls, not an exhaustive seed search.
    for seed in (48570, 48572):
        control, _ = generate(seed)
        matches = sum(a == b for a, b in zip(control, reference))
        print(f'Control seed {seed}: {matches}/256 entries match')


if __name__ == '__main__':
    main()
