# Testing and Benchmarks

The `onlynv` package aims to be a drop-in replacement for `dotenv`. As such, it runs the main tests from [dotenv](https://github.com/motdotla/dotenv) to ensure compatibility. We also benchmark[^1] the packages' `parse` functions to ensure that `onlynv` is as fast as it can be.

[^1]: Microbenchmarks are not always indicative of real-world performance. Additionally, at this level, differences are negligible. However, we still run the benchmarks to ensure that we are not regressing.

## Benchmark Results

All tests and benchmarks run on a M1 Macbook Pro with 16GB of RAM.

| Package | hz        | min    | max    | mean   | p75    | p99    | p999   | rme    | runs sampled |
| ------- | --------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------------ |
| dotenv  | 46,062.75 | 0.0208 | 0.2970 | 0.0217 | 0.0213 | 0.0310 | 0.1120 | ±0.32% | 23034        |
| onlynv  | 67,354.30 | 0.0142 | 0.2263 | 0.0148 | 0.0146 | 0.0180 | 0.1162 | ±0.37% | 33678        |

This shows a ~46.0% speedup when using `onlynv` over `dotenv`.

## Replicating the Results

To run the benchmarks, you can use the following command:

```bash
pnpm bench
```

To run the tests, you can use the following command:

```bash
pnpm test
```
