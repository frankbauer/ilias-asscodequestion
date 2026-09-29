# Pyodide 0.29.3 - third-party notices

Pyodide (`pyodide.js`, `pyodide.asm.js`, `pyodide.asm.wasm`, ...) is licensed
under the Mozilla Public License 2.0, see `LICENSE`. Unmodified upstream
distribution; source: https://github.com/pyodide/pyodide/tree/0.29.3

The Pyodide runtime contains:

| Component | License | Text |
|---|---|---|
| CPython interpreter and standard library (`pyodide.asm.wasm`, `python_stdlib.zip`) | PSF-2.0 | `licenses/PSF-2.0-CPython.txt` |
| Emscripten runtime (`pyodide.asm.js`) | MIT / University of Illinois NCSA | https://github.com/emscripten-core/emscripten/blob/main/LICENSE |

## Shared libraries (`lib*.zip`)

Licenses as declared in the Pyodide recipes (`packages/<name>/meta.yaml`,
https://github.com/pyodide/pyodide-recipes); libcrc32c declares none, its
upstream LICENSE (google/crc32c 1.1.0) is BSD-3-Clause.

| Archive | Project | License |
|---|---|---|
| libcrc32c-1.1.0.zip | google/crc32c | BSD-3-Clause |
| libgdal-3.8.3.zip | GDAL | MIT |
| libgeos-3.12.1.zip | GEOS | LGPL-2.1 |
| libhdf5-1.12.1.zip | HDF5 | BSD-3-Clause (HDF5 license) |
| libheif-1.12.0.zip | libheif | LGPL-3.0 |
| libmagic-5.42.zip | file/libmagic | BSD-2-Clause |
| libngspice-44.2.zip | ngspice | BSD-3-Clause |
| libopenblas-0.3.26.zip | OpenBLAS | BSD-3-Clause |
| libopenssl-1.1.1w.zip | OpenSSL 1.1.1w | OpenSSL License + original SSLeay License (per OpenSSL_1_1_1w/LICENSE; the Pyodide recipe lists Apache-2.0, which applies to OpenSSL 3.x) |
| libproj-9.6.2.zip | PROJ | MIT |
| libsuitesparse-5.11.0.zip | SuiteSparse | mixed, per component (BSD-3, LGPL-2.1+, GPL-2.0+) |
| libtaglib-2.1.1.zip | TagLib | LGPL-2.1 / MPL-1.1 |

The (L)GPL libraries are distributed unmodified as built by the Pyodide
project; corresponding source is available via the Pyodide recipes at
https://github.com/pyodide/pyodide/tree/0.29.3/packages and from the upstream
projects.

## Python packages (`*.whl`)

Every wheel is an unmodified package from the Pyodide 0.29.3 distribution.
The license texts are shipped **inside each wheel** (`<name>.dist-info/licenses/`
or `<name>.dist-info/LICENSE*`) where the column "License file in wheel" says
`yes`. Wheels without an embedded license file are covered by the texts in
`licenses/` (PSF-2.0, GPL-3.0) or by the standard MIT/BSD/Apache terms named
here. GPL-licensed packages are only loaded on demand when user code imports
them; source is available on PyPI and in the Pyodide repository.

| Package | Version | License (from package metadata) | License file in wheel |
|---|---|---|---|
| affine | 2.4.0 | BSD License | yes |
| aiohappyeyeballs | 2.6.1 | PSF-2.0 | yes |
| aiohttp | 3.11.13 | Apache-2.0 | yes |
| aiosignal | 1.3.2 | Apache 2.0 | yes |
| altair | 6.0.0 | BSD License | yes |
| annotated-types | 0.7.0 | MIT License | yes |
| anyio | 4.9.0 | MIT | yes |
| apsw | 3.50.4.0 | any-OSI | yes |
| argon2-cffi | 23.1.0 | MIT | yes |
| argon2-cffi-bindings | 21.2.0 | MIT | yes |
| asciitree | 0.3.3 | MIT | yes |
| astropy | 7.0.1 | BSD-3-Clause | yes |
| astropy-iers-data | 0.2025.3.10.0.29.26 | BSD License | yes |
| asttokens | 3.0.0 | Apache 2.0 | yes |
| async-timeout | 5.0.1 | Apache 2 | yes |
| atomicwrites | 1.4.1 | MIT | yes |
| attrs | 25.2.0 | MIT | yes |
| audioop-lts | 0.2.1 | PSF-2.0 | yes |
| autograd | 1.7.0 | MIT License | no |
| awkward_cpp | 47 | BSD-3-Clause AND MIT | yes |
| b2d | 0.7.4 | see license file in wheel | yes |
| bcrypt | 4.3.0 | Apache-2.0 | yes |
| beautifulsoup4 | 4.13.3 | MIT License | yes |
| bilby.cython | 0.5.3 | MIT | yes |
| biopython | 1.85 | Freely Distributable | yes |
| bitarray | 3.8.0 | PSF-2.0 | yes |
| bitstring | 4.3.1 | MIT License | yes |
| bleach | 6.2.0 | Apache Software License | yes |
| blosc2 | 3.5.1 | BSD-3-Clause | yes |
| boost-histogram | 1.6.1 | BSD-3-Clause AND BSL-1.0 | yes |
| Bottleneck | 1.6.0 | Simplified BSD | yes |
| brotli | 1.2.0 | MIT | yes |
| cachetools | 5.5.2 | MIT | yes |
| Cartopy | 0.25.0 | BSD-3-Clause | yes |
| casadi | 3.7.0 | GNU Lesser General Public License v3 or later (LGPLv3+) | yes |
| cbor-diag | 1.0.1 | MIT OR Apache-2.0 | no |
| certifi | 2026.1.4 | MPL-2.0 | yes |
| cffi | 1.17.1 | MIT | yes |
| cffi-example | 0.1 | BSD License | yes |
| cftime | 1.6.4.post1 | License :: OSI Approved :: MIT License | yes |
| charset-normalizer | 3.4.4 | MIT | yes |
| clarabel | 0.11.0 | Apache-2.0 | yes |
| click | 8.3.1 | BSD-3-Clause | yes |
| cligj | 0.7.2 | BSD | yes |
| clingo | 5.8.0 | MIT | yes |
| cloudpickle | 3.1.1 | BSD-3-Clause | no |
| cmyt | 2.0.2 | BSD 3-Clause | yes |
| cobs | 1.2.1 | MIT License | yes |
| colorspacious | 1.1.2 | MIT | no |
| contourpy | 1.3.1 | BSD License | yes |
| CoolProp | 7.2.0 | MIT | yes |
| coverage | 7.6.12 | Apache-2.0 | yes |
| cramjam | 2.10.0rc1 | see license file in wheel | yes |
| crc32c | 2.7.1 | LGPL-2.1-or-later | yes |
| cryptography | 46.0.3 | Apache-2.0 OR BSD-3-Clause | yes |
| css-inline | 0.16.0 | MIT License | yes |
| cssselect | 1.3.0 | BSD | yes |
| cvxpy-base | 1.6.3 | Apache License, Version 2.0 | yes |
| cycler | 0.12.1 | BSD License | yes |
| cysignals | 1.12.3 | GNU Lesser General Public License v3 or later (LGPLv3+) | yes |
| cytoolz | 1.0.1 | BSD | yes |
| decorator | 5.2.1 | BSD-2-Clause | yes |
| demes | 0.2.3 | ISC | yes |
| deprecation | 2.1.0 | Apache 2 | yes |
| diskcache | 5.6.3 | Apache 2.0 | yes |
| distlib | 0.3.9 | PSF-2.0 | yes |
| distro | 1.9.0 | Apache License, Version 2.0 | yes |
| docutils | 0.21.2 | Public Domain, Python Software Foundation License, BSD License, GNU General Public License (GPL) | yes |
| donfig | 0.8.1.post1 | MIT | yes |
| ewah_bool_utils | 1.2.2 | BSD | yes |
| exceptiongroup | 1.2.2 | MIT License | yes |
| executing | 2.2.0 | MIT | yes |
| fastapi | 0.116.1 | MIT License | yes |
| fastcan | 0.5.0 | MIT License | yes |
| fastparquet | 2024.11.0 | Apache License 2.0 | yes |
| fonttools | 4.56.0 | MIT | yes |
| freesasa | 2.2.1 | MIT | yes |
| frozenlist | 1.6.0 | Apache-2.0 | yes |
| fsspec | 2025.3.2 | BSD License | yes |
| future | 1.0.0 | MIT | yes |
| galpy | 1.10.2 | New BSD | yes |
| geopandas | 1.1.1 | BSD 3-Clause | yes |
| gmpy2 | 2.1.5 | LGPL-3.0+ | yes |
| google-crc32c | 1.8.0 | see license file in wheel | yes |
| gsw | 3.6.19 | BSD-3-Clause | yes |
| h11 | 0.14.0 | MIT | yes |
| h3 | 4.2.2 | Apache Software License | yes |
| h5py | 3.13.0 | BSD-3-Clause | yes |
| hashlib | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| healpy | 1.19.0 | GPL-2.0-only | yes |
| highspy | 1.11.0 | MIT License | yes |
| html5lib | 1.1 | MIT License | yes |
| httpcore | 1.0.7 | BSD-3-Clause | yes |
| httpx | 0.28.1 | BSD-3-Clause | yes |
| idna | 3.10 | BSD License | yes |
| igraph | 0.11.8 | GNU General Public License (GPL) | yes |
| imageio | 2.37.0 | BSD-2-Clause | yes |
| iminuit | 2.30.1 | MIT License, GNU Library or Lesser General Public License (LGPL) | yes |
| iniconfig | 2.0.0 | MIT | yes |
| iniconfig | 2.1.0 | MIT | yes |
| InSpice | 1.6.4.1 | GPL-3.0-or-later | yes |
| ipython | 9.0.2 | BSD-3-Clause | yes |
| jedi | 0.19.2 | MIT | yes |
| Jinja2 | 3.1.6 | BSD License | yes |
| jiter | 0.9.0 | MIT | no |
| joblib | 1.4.2 | BSD 3-Clause | yes |
| jsonpatch | 1.33 | Modified BSD License | yes |
| jsonpointer | 3.0.0 | Modified BSD License | yes |
| jsonschema | 4.23.0 | MIT | yes |
| jsonschema-specifications | 2024.10.1 | MIT License | yes |
| kiwisolver | 1.4.8 | BSD License | yes |
| lakers-python | 0.6.0 | BSD-3-Clause | no |
| lazy_loader | 0.4 | BSD License | yes |
| lazy-object-proxy | 1.10.0 | BSD-2-Clause | yes |
| libcst | 1.6.0 | MIT License | yes |
| lightgbm | 4.6.0 | MIT License | yes |
| Logbook | 1.8.0 | BSD-3-Clause | yes |
| lxml | 6.0.2 | BSD-3-Clause | yes |
| lz4 | 4.4.5 | BSD License | yes |
| lzma | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| MarkupSafe | 3.0.2 | BSD License | yes |
| memory_allocator | 0.1.4 | GPLv3 | yes |
| micropip | 0.11.0 | Mozilla Public License 2.0 (MPL 2.0) | yes |
| ml_dtypes | 0.5.4 | Apache-2.0 | yes |
| mmh3 | 5.1.0 | MIT License | yes |
| more-itertools | 10.6.0 | MIT License | yes |
| mpmath | 1.3.0 | BSD | yes |
| msgpack | 1.1.2 | Apache-2.0 | yes |
| msgspec | 0.19.0 | BSD | yes |
| msprime | 1.3.3 | GNU GPLv3+ | yes |
| multidict | 6.7.0 | Apache License 2.0 | yes |
| munch | 4.0.0 | MIT | yes |
| mypy | 1.15.0 | MIT | yes |
| narwhals | 2.15.0 | MIT License | yes |
| ndindex | 1.9.2 | MIT | yes |
| netCDF4 | 1.7.2 | MIT | yes |
| networkx | 3.4.2 | BSD License | yes |
| newick | 1.9.0 | Apache 2.0 | yes |
| nh3 | 0.2.21 | MIT | yes |
| nlopt | 2.9.1 | see license file in wheel | yes |
| nltk | 3.9.1 | Apache License, Version 2.0 | yes |
| numcodecs | 0.13.1 | MIT | yes |
| numpy | 2.2.5 | BSD License | yes |
| numpy-tests | 2.2.5 | BSD License | yes |
| openai | 1.68.2 | Apache-2.0 | yes |
| opencv-python | 4.11.0.86 | Apache 2.0 | yes |
| optlang | 1.8.3 | Apache-2.0 | yes |
| orjson | 3.10.16 | Apache-2.0 OR MIT | yes |
| packaging | 24.2 | Apache Software License, BSD License | yes |
| pandas | 2.3.3 | BSD License | yes |
| parso | 0.8.4 | MIT | yes |
| patsy | 1.0.1 | 2-clause BSD | yes |
| pcodec | 0.3.3 | Apache-2.0 | no |
| peewee | 3.17.9 | MIT License | yes |
| pi_heif | 0.21.0 | BSD-3-Clause | yes |
| pillow | 11.3.0 | MIT-CMU | yes |
| pillow_heif | 1.1.1 | BSD-3-Clause | yes |
| pkgconfig | 1.5.5 | MIT | yes |
| platformdirs | 4.3.6 | MIT | yes |
| pluggy | 1.5.0 | MIT | yes |
| ply | 3.11 | BSD | no |
| pplpy | 0.8.10 | GPL v3 | yes |
| primecountpy | 0.1.1 | see license file in wheel | yes |
| prompt_toolkit | 3.0.50 | BSD License | yes |
| propcache | 0.3.0 | Apache-2.0 | yes |
| protobuf | 6.31.1 | BSD-3-Clause | yes |
| pure_eval | 0.2.3 | MIT | yes |
| py | 1.11.0 | MIT license | yes |
| pycdfpp | 0.8.5 | MIT License | yes |
| pyclipper | 1.3.0.post6 | MIT | yes |
| pycparser | 2.22 | BSD-3-Clause | yes |
| pycryptodome | 3.21.0 | BSD, Public Domain | yes |
| pydantic | 2.12.5 | MIT | yes |
| pydantic_core | 2.41.5 | MIT | yes |
| pydecimal | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| pydoc_data | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| pyerfa | 2.0.1.5 | BSD 3-Clause License | yes |
| Pygments | 2.19.1 | BSD-2-Clause | yes |
| pyheif | 0.8.0 | Apache Software License | yes |
| pyiceberg | 0.10.0 | Apache-2.0 | yes |
| pyinstrument | 5.0.1 | BSD License | yes |
| pylimer_tools | 0.3.13 | GPL-3.0-or-later | yes |
| PyNaCl | 1.5.0 | Apache License 2.0 | yes |
| pyodide-http | 0.2.2 | MIT | yes |
| pyodide-unix-timezones | 1.0.0 | MIT License | no |
| pyparsing | 3.2.1 | MIT License | yes |
| pyproj | 3.7.2 | MIT | yes |
| pyrodigal | 3.7.0 | GPL-3.0-or-later | yes |
| pyrsistent | 0.20.0 | MIT | yes |
| pyshp | 2.3.1 | MIT | yes |
| pytaglib | 3.0.1 | GPLv3+ | yes |
| pytest | 8.3.5 | MIT | yes |
| pytest-asyncio | 0.25.3 | Apache 2.0 | yes |
| pytest-benchmark | 4.0.0 | BSD-2-Clause | yes |
| pytest-httpx | 0.30.0 | MIT License | yes |
| python-calamine | 0.5.3 | MIT | yes |
| python-dateutil | 2.9.0.post0 | Dual License | yes |
| python-flint | 0.8.0 | see license file in wheel | yes |
| python-magic | 0.4.27 | MIT | yes |
| python-sat | 1.8.dev26 | MIT | yes |
| python_solvespace | 3.0.8 | GPLv3+ | no |
| pytz | 2025.2 | MIT | yes |
| PyWavelets | 1.8.0 | MIT License | yes |
| pyxirr | 0.10.6 | Unlicense | yes |
| PyYAML | 6.0.2 | MIT | yes |
| rateslib | 2.5.1 | see license file in wheel | yes |
| rebound | 4.4.7 | GPL | yes |
| reboundx | 4.4.1 | GPL | yes |
| referencing | 0.36.2 | MIT | yes |
| regex | 2024.11.6 | Apache Software License | yes |
| requests | 2.32.4 | Apache-2.0 | yes |
| retrying | 1.3.4 | Apache 2.0 | yes |
| rich | 13.9.4 | MIT | yes |
| river | 0.22.0 | see license file in wheel | yes |
| robotraconteur | 1.2.7 | Apache-2.0 | yes |
| rpds-py | 0.30.0 | MIT | yes |
| ruamel.yaml | 0.18.10 | MIT license | yes |
| rustworkx | 0.17.1 | Apache-2.0 | yes |
| scikit-image | 0.25.2 | BSD License | yes |
| scikit-learn | 1.7.0 | BSD License | yes |
| scipy | 1.14.1 | BSD License | yes |
| screed | 1.1.3 | BSD 3-clause | yes |
| setuptools | 76.0.0 | MIT License | yes |
| shapely | 2.0.7 | BSD 3-Clause | yes |
| simplejson | 3.20.1 | MIT License | yes |
| sisl | 0.16.2 | MPL-2.0 | yes |
| six | 1.17.0 | MIT | yes |
| smart-open | 7.1.0 | MIT | yes |
| sniffio | 1.3.1 | MIT OR Apache-2.0 | yes |
| sortedcontainers | 2.4.0 | Apache 2.0 | yes |
| soundfile | 0.12.1 | BSD 3-Clause License | yes |
| soupsieve | 2.6 | MIT | yes |
| sourmash | 4.8.14 | BSD-3-Clause | yes |
| soxr | 0.5.0.post1 | GNU Lesser General Public License v2 or later (LGPLv2+) | yes |
| sparseqr | 1.2 | Public Domain CC0 | yes |
| SQLAlchemy | 2.0.39 | MIT | yes |
| sqlite3 | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| ssl | 1.0.0 | PSF-2.0 (CPython standard library module) | no |
| stack-data | 0.6.3 | MIT | yes |
| starlette | 0.47.2 | BSD-3-Clause | yes |
| statsmodels | 0.14.4 | BSD License | yes |
| strictyaml | 1.7.3 | MIT | yes |
| svgwrite | 1.4.3 | MIT License | yes |
| swiglpk | 5.0.12 | GPL v3 | yes |
| sympy | 1.13.3 | BSD | yes |
| tblib | 3.0.0 | BSD-2-Clause | yes |
| termcolor | 2.5.0 | MIT | yes |
| texttable | 1.7.0 | MIT | yes |
| texture2ddecoder | 1.0.5 | MIT License | yes |
| threadpoolctl | 3.5.0 | BSD-3-Clause | yes |
| tiktoken | 0.9.0 | see license file in wheel | yes |
| tomli | 2.2.1 | MIT License | yes |
| tomli_w | 1.2.0 | MIT License | yes |
| toolz | 1.0.0 | BSD | yes |
| tqdm | 4.67.1 | MPL-2.0 AND MIT | yes |
| traitlets | 5.14.3 | BSD License | yes |
| traits | 7.0.2 | BSD | yes |
| tree-sitter | 0.23.2 | MIT License | yes |
| tree-sitter-go | 0.23.3 | MIT | yes |
| tree-sitter-java | 0.23.4 | MIT | yes |
| tree-sitter-python | 0.23.4 | MIT | yes |
| tskit | 1.0.0 | MIT | yes |
| typing_extensions | 4.15.0 | PSF-2.0 | yes |
| typing-inspection | 0.4.2 | MIT | yes |
| tzdata | 2025.3 | Apache-2.0 | yes |
| ujson | 5.11.0 | see license file in wheel | yes |
| uncertainties | 3.2.2 | Revised BSD License | yes |
| unyt | 3.0.3 | BSD-3-Clause | yes |
| urllib3 | 2.5.0 | MIT | yes |
| vega-datasets | 0.9.0 | MIT | yes |
| vrplib | 2.0.1 | MIT | no |
| wcwidth | 0.2.13 | MIT | yes |
| webencodings | 0.5.1 | BSD | no |
| wordcloud | 1.9.4 | MIT License | yes |
| wrapt | 1.17.2 | BSD | yes |
| xarray | 2025.12.0 | Apache-2.0 | yes |
| xgboost | 2.1.4 | Apache-2.0 | no |
| xlrd | 2.0.1 | BSD | yes |
| xxhash | 3.5.0 | BSD | yes |
| xyzservices | 2025.1.0 | 3-Clause BSD | yes |
| yarl | 1.18.3 | Apache-2.0 | yes |
| yt | 4.4.0 | BSD 3-Clause | yes |
| zengl | 2.7.1 | MIT | yes |
| zfpy | 1.0.1 | see license file in wheel | yes |
| zstandard | 0.23.0 | BSD | yes |
