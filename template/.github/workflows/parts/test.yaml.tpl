  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['{minNodeVersion}']
    name: Test on Node ${{ matrix.node }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node }}
      - uses: pnpm/action-setup@v2.1.0
        with:
          version: {pnpmVersion}
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
