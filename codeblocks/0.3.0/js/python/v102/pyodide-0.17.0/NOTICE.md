# Pyodide 0.17.0 - third-party notices

Pyodide (`pyodide.js`, `pyodide.asm.js`, `pyodide.asm.wasm`, ...) is licensed
under the Mozilla Public License 2.0, see `LICENSE`. Unmodified upstream
distribution; source: https://github.com/pyodide/pyodide/tree/0.17.0

The Pyodide runtime contains:

| Component | License | Text |
|---|---|---|
| CPython interpreter and standard library (`pyodide.asm.wasm`, `python_stdlib.zip`) | PSF-2.0 | `licenses/PSF-2.0-CPython.txt` |
| Emscripten runtime (`pyodide.asm.js`) | MIT / University of Illinois NCSA | https://github.com/emscripten-core/emscripten/blob/main/LICENSE |

## Python packages (`*.data` / `*.js`)

The packages are unmodified builds from the Pyodide 0.17.0 distribution
(packed Emscripten file systems, license files are not embedded).
Source and license texts: https://github.com/pyodide/pyodide/tree/0.17.0/packages
and the upstream projects on PyPI. GPL-3.0 text (swiglpk): `licenses/GPL-3.0.txt`.

| Package | Version | License (PyPI metadata of this version) |
|---|---|---|
| CLAPACK | 3.2.1 | LAPACK license (modified BSD), not on PyPI: http://www.netlib.org/lapack/LICENSE.txt |
| Jinja2 | 2.11.3 | BSD-3-Clause |
| MarkupSafe | 1.1.1 | BSD-3-Clause |
| Pygments | 2.8.1 | BSD License |
| asciitree | 0.3.3 | MIT |
| astropy | 3.2.3 | BSD 3-Clause License |
| atomicwrites | 1.4.0 | MIT |
| attrs | 20.3.0 | MIT |
| autograd | 1.3 | MIT |
| beautifulsoup4 | 4.9.3 | MIT |
| biopython | 1.78 | Freely Distributable |
| bleach | 3.3.0 | Apache Software License |
| cloudpickle | 1.6.0 | BSD 3-Clause License |
| cssselect | 1.1.0 | BSD License |
| cycler | 0.10.0 | BSD |
| cytoolz | 0.11.0 | BSD License |
| decorator | 5.0.6 | new BSD License |
| distlib | 0.3.1 | Python license |
| docutils | 0.17 | BSD License, GNU General Public License (GPL), Python Software Foundation License, Public Domain |
| freesasa | 2.1.0 | MIT |
| future | 0.18.2 | MIT (OSI Approved, MIT License) |
| html5lib | 1.1 | MIT License |
| imageio | 2.9.0 | BSD-2-Clause |
| jedi | 0.18.0 | MIT |
| joblib | 0.11 | BSD License |
| kiwisolver | 1.3.1 | BSD License |
| lxml | 4.4.1 | BSD License |
| matplotlib | 3.3.3 | PSF (Python Software Foundation License) |
| micropip | 0.1 | Mozilla Public License 2.0 (MPL 2.0) |
| mne | 0.18.2 | BSD (3-clause) |
| more-itertools | 8.7.0 | MIT |
| mpmath | 1.1.0 | BSD |
| msgpack | 1.0.2 | Apache 2.0 (Apache Software License) |
| networkx | 2.5.1 | BSD License |
| nlopt | 2.7.0 | MIT |
| nltk | 3.6.1 | Apache License, Version 2.0 |
| nose | 1.3.7 | GNU LGPL (GNU Library or Lesser General Public License (LGPL)) |
| numcodecs | 0.7.2 | MIT |
| numpy | 1.17.5 | OSI Approved |
| optlang | 1.5.1 | Apache-2.0 (Apache Software License) |
| packaging | 20.9 | BSD-2-Clause or Apache-2.0 |
| pandas | 1.0.5 | BSD |
| parso | 0.8.2 | MIT |
| patsy | 0.5.1 | 2-clause BSD |
| pillow | 8.0.1 | HPND (Historical Permission Notice and Disclaimer (HPND)) |
| plotly | 4.14.3 | MIT |
| pluggy | 0.13.1 | MIT license (MIT License) |
| py | 1.9.0 | MIT license (MIT License) |
| pyodide-interrupts | 0.1.1 | MIT License |
| pyparsing | 2.4.7 | MIT License |
| pytest | 3.6.3 | MIT license (MIT License) |
| python-dateutil | 2.8.1 | Apache Software License, BSD License |
| python-sat | 0.1.6.dev6 | MIT |
| pytz | 2021.1 | MIT |
| pywavelets | 1.1.1 | MIT |
| regex | 2021.4.4 | Apache Software License |
| retrying | 1.3.3 | Apache 2.0 (Apache Software License) |
| scikit-image | 0.15.0 | Modified BSD |
| scikit-learn | 0.22.2 | new BSD |
| scipy | 0.17.1 | BSD License |
| setuptools | 40.0.0 | MIT License |
| six | 1.15.0 | MIT |
| soupsieve | 2.2.1 | MIT License |
| statsmodels | 0.9.0 | BSD License |
| swiglpk | 4.65.1 | GPL v3 (GNU General Public License v3 (GPLv3)) |
| sympy | 1.8 | BSD License |
| toolz | 0.11.1 | BSD License |
| traits | 6.2.0 | BSD License |
| uncertainties | 3.1.5 | Revised BSD License |
| webencodings | 0.5.1 | BSD License |
| xlrd | 2.0.1 | BSD License |
| yt | 3.6.1 | BSD 3-Clause |
| zarr | 2.6.1 | MIT |
| pyodide, webworker (runtime files) | 0.17.0 | MPL-2.0 (Pyodide) |
