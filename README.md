# Guitar Scale Board

`/home/wsh/qpy/tespy/tespy/misc/guitar_scale.py` の SVG 生成ロジックを Next.js に移植したWebアプリです。キー、スケールプリセット、12音ラベルをブラウザ上で変更し、結果をSVGとして書き出せます。

## 開発

```bash
pnpm dev
```

ブラウザで <http://localhost:3000> を開きます。

## 検証

```bash
pnpm lint
pnpm build
pnpm exec playwright test
```

## ドキュメント

- [移植メモと仕様](docs/guitar-scale-web.md)
