# Guitar Scale Board 移植ドキュメント

## 概要

このWebアプリは、Python CLI `guitar_scale.py gen` が出力していたギター指板SVGをブラウザ上で生成します。Next.js App Router の単一ページとして実装し、ユーザー操作に応じてReactでSVG要素を再描画します。

## 移植した機能

- キー選択
- スケールプリセット選択
- 異名同音のキー入力対応
- 12音分のラベル定義
- `.` 付きラベルを強調音として扱う仕様
- 24フレット指板の平均律ベース位置計算
- ナット、フレット、弦、ポジションマーク、音名ラベルのSVG描画
- 表示中SVGのダウンロード

## Python版との対応

| Python版 | Web版 |
| --- | --- |
| `NOTE_INDICES` | `NOTE_INDICES` |
| `ENHARMONICS` | `ENHARMONICS` |
| `SCALE_PRESETS` | `SCALE_PRESETS` |
| `SCALE_ALIASES` | `SCALE_ALIASES` |
| `calc_normalized_fret_positions()` | `calcNormalizedFretPositions()` |
| `build_fretboard()` | `buildFretboard()` |
| `render_svg()` | React SVG JSX |
| `--notes` | Notes テキストエリア |
| `--out` | SVGを書き出しボタン |

## ラベル仕様

Notes は空白区切りで12個指定します。各トークンはルートからの半音オフセット順です。

例:

```text
.1 ♭9 9 .♭3 3 11 ♯11 .5 ♭13 13 .♭7 Δ7
```

先頭に `.` が付いたトークンは強調音です。表示時には `.` を取り除き、濃い丸と白文字で描画します。

## 指板仕様

- チューニングは標準チューニング `E A D G B E` です。
- 内部の音インデックスはPython版と同じく `A = 0` から始まります。
- 表示範囲は0から24フレットです。
- フレット位置は `L - L / 2^(n/12)` を正規化して計算します。
- 12フレットと24フレットは太いフレット線、3/5/7/9/15/17/19/21は単一インレイ、12/24は二重インレイです。

## 実装メモ

アプリ本体は [app/page.tsx](/home/wsh/d/s/guitar_board/app/page.tsx) にあります。状態管理はReactの `useState` のみで、サーバーAPIは使っていません。SVGダウンロードは画面上の `<svg>` を `XMLSerializer` で文字列化し、Blob URLを一時的に作って実行します。

## 今後の拡張候補

- 右利き/左利き表示の切り替え
- フレット数やチューニングの編集
- プリセットのJSONインポート/エクスポート
- PNG書き出し
