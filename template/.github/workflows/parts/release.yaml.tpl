  release:
    needs: [test]
    if: ${{ github.ref == 'refs/heads/main' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['{minNodeVersion}']
    name: Release on NPM
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
      - run: pnpm release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
