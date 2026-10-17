# Skipjack F-table generation experiment

Verified on 2026-10-17. **Partial reproduction:** the posted generator with
`srand48(48571)` matches **173/256 entries (67.58%)** of Skipjack's published
F-table. The other **83 entries** can be reconciled using **52 entry swaps**.
Those swaps are derived from the reference table, not from a recovered design
rule. The posted code alone does **not** reproduce the complete S-box.

## Sources and provenance

- [Ava Howell's algorithm post](https://x.com/avhwl/status/2111579355730313695),
  posted 2026-10-17 at 22:05:24 UTC.
- [Steve Weis's claim](https://x.com/sweis/status/2111545590073221206), posted
  2026-10-17 at 19:51:13 UTC. It attributes the finding to Claude and Ava Howell
  and explicitly qualifies the generator with “plus some swaps.”
- [NIST-hosted SKIPJACK and KEA Algorithm Specifications, Version 2.0,
  29 May 1998](https://csrc.nist.gov/csrc/media/projects/cryptographic-algorithm-validation-program/documents/skipjack/skipjack.pdf),
  page 8, section 7, F Table. The high input nibble selects the row, the low
  nibble selects the column. `f-table.hex` is a row-major transcription from
  a rendered image of that page. The downloaded PDF SHA-256 was
  `9b2dc97b3719e90d62ebd8e606482b35fc31dd444e5d7a729099dc5b003e0770`.
- [POSIX drand48 specification](https://pubs.opengroup.org/onlinepubs/9699919799/functions/drand48.html)
  defines the initialization, recurrence, and output semantics used below.
- [Crypto++ Skipjack implementation](https://github.com/weidai11/cryptopp/blob/master/skipjack.cpp)
  supplied a second transcription check: all 256 `fTable` bytes matched the
  NIST transcription when retrieved on 2026-10-17. The experiment pins the
  reference byte digest rather than depending on this moving branch.

Direct retrieval of the X pages returned HTTP 403. Their text and timestamps
were retrieved through the FxTwitter API (`https://api.fxtwitter.com/<author>/status/<id>`)
on 2026-10-17. Minimal snapshots are saved in `sources/algorithm.json` and
`sources/claim.json`. These are third-party renderings of the linked primary
posts, not independently authenticated X exports. `generate.c` preserves the
algorithm text with only standard headers and a `main` wrapper added.

## Reproduce

From the repository root, with Python 3 and a POSIX C compiler/libc providing
`srand48` and `drand48`:

```sh
python3 experimental/skipjack/verify.py
```

No Python packages or network access are required. The script compiles the
posted C in a temporary directory, runs it, and compares its output against a
separate integer implementation. Compiler failures or failed checks exit
nonzero. `verification.txt` records the complete output, including every
mismatch and the derived swaps. To refresh it:

```sh
python3 experimental/skipjack/verify.py > experimental/skipjack/verification.txt
```

## Method and observations

1. Initialize the 48-bit state to `(48571 << 16) | 0x330e`.
2. Before each draw, update `state = (0x5deece66d * state + 0xb) mod 2^48`.
3. Take `v = state >> 40`. This is exactly `floor(256 * drand48())`.
4. On the first occurrence of index `v`, assign it the next integer `k`, starting
   at zero. Ignore repeated indices; stop after all 256 indices have been filled.
   This distinction matters: the algorithm stores the discovery rank at each
   drawn index, rather than appending drawn indices to a list.
5. Compare all bytes to the reference and derive corrections by scanning
   indices in ascending order and swapping each wrong value with the location
   holding its required value. For permutations this takes the minimum number
   of arbitrary entry swaps (each cycle of length `n` needs `n - 1` swaps).

The generator takes **1,399 draws**. Native C and the independent integer
implementation agree on **all 256 entries**. Both generated and reference
tables are permutations of 0 through 255. Examples: index `00` matches at `a3`,
but index `09` produces `22` instead of `21`, and index `0c` produces `de`
instead of `99`. Correcting the 83 mismatches takes 52 swaps and yields a
byte-for-byte match. Nearby control seeds 48570 and 48572 each match only
1/256 entries; these controls are not an exhaustive seed search or a formal
statistical significance test.

| Table (256 raw bytes) | SHA-256 |
| --- | --- |
| Unmodified generator | `3f90a90d82890a3e26169339753e689b5ac9899b86d1d99eba6433459caf20c0` |
| Official / corrected | `3587a8b7cde06e199ec29100dfe96c61ae1999de95308b8abc49d38f12565624` |

## Interpretation and limits

The large overlap supports a relationship between the specified generator and
the published F-table, and reproduces the concrete numerical part of the
claim. It does not recover a complete historical generation procedure. Neither
linked post supplies the swap-selection rule or explains the seed choice.
Any permutation can be converted into any other using swaps, so the exact
match after deriving corrections from the target is not independent evidence
of how the designers chose those corrections. The 52 swaps reported here need
not be the historical operations intended by “some swaps.”

This experiment does not establish Claude's contribution, novelty, the original
designers' intent, or the presence or absence of a backdoor. AI attribution
comes from the linked authors. The site labels this as evidence against a backdoor. The partial match and
these limits are retained in its dataset caveat and documented here.
