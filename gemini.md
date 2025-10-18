# アプリケーションデータ永続化計画書

## 1. はじめに
本ドキュメントは、現在のWebアプリケーション（useLocalStorageによるクライアントサイド保存）のデータを、サーバーサイドのMySQLデータベースに永続化するための計画を定義するものです。これにより、アプリケーションはステートフルなWebサービスとしてデプロイ可能になり、ユーザーデータはデバイスやセッションに依存せず安全に保持されます。

## 2. データ全体の棚卸し
まず、アプリケーション内に存在するすべてのデータ構造を `types.ts` ファイルを基に洗い出します。これらがデータベースで管理すべき対象となります。

*   **UserProfile:** ユーザーの基本設定
    *   `motivationType`: 動機付けのタイプ ('approach' | 'avoidance')
    *   `shadowWorkPasscode`: シャドウワーク用のパスコード（要ハッシュ化）
    *   `values`: ユーザーが定義した価値観
    *   `habit7Assessments`: 7つの習慣の自己評価スコア
    *   `dailyFocuses`: 日々のフォーカス設定
*   **BigRock:** 人生の大きな目標（ビジョン）
    *   `VisionBoard`: タイトル、画像、アファメーション
    *   `CommitmentContract`: ご褒美と罰
    *   `status`: 'todo', 'in_progress', 'done'
*   **ImpulseLog:** 衝動制御のログ
*   **Challenge / CompletedChallenge:** コンフォートゾーン拡大チャレンジとその達成記録
*   **Routine / RoutineBlock:** 習慣とその構成ブロック
    *   `disciplineMode`: ストイックモードの設定
    *   `victorsLog`: 小さな勝利の記録
*   **BadHabit / BadHabitLog:** 悪習慣とそのログ
*   **JournalEntry (複合型):** ジャーナル記録
    *   `CognitiveJournalEntry`: 思考改善ジャーナル (CBT)
    *   `FreeJournalEntry`: フリージャーナル（インパクト・ログ含む）
    *   `ImpactLogEntry`: インパクトログ
*   **ShadowJournalEntry / Belief:** シャドウワークの記録と、それによって見つかった信念

## 3. MySQLデータベース設計案
上記のデータを格納するため、正規化を考慮したテーブル設計を以下に提案します。

### 3.1. ER図（概念）
*   `users` テーブルがすべてのデータの中心となります。
*   `users` に対して、`big_rocks`, `routines`, `bad_habits`, `challenges`, `journal_entries`, `shadow_journal_entries`, `beliefs` などが1対多の関係で紐づきます。
*   `routines` に対して `routine_blocks` が1対多の関係で紐づきます。
*   `bad_habits` に対して `bad_habit_logs` が1対多の関係で紐づきます。
*   `challenges` に対して `completed_challenges` が1対多の関係で紐づきます。

### 3.2. CREATE TABLE文
```sql
-- ユーザー情報を管理する基本テーブル
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motivation_type ENUM('approach', 'avoidance', 'unknown') NOT NULL DEFAULT 'unknown',
    shadow_work_passcode VARCHAR(255) NULL, -- bcryptなどでハッシュ化して保存
    `values` TEXT NULL,
    habit7_assessments JSON NULL, -- { "exceed_expectations": 5, ... }
    daily_focuses JSON NULL, -- [{ "date": "YYYY-MM-DD", ... }]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Big Rocks（人生のビジョン）
CREATE TABLE big_rocks (
    id VARCHAR(36) PRIMARY KEY, -- フロントのIDをそのまま使う想定
    user_id INT NOT NULL,
    vision_board JSON NOT NULL, -- { "title": "...", "images": ["...", ...], "affirmations": "..." }
    commitment_contract JSON NULL, -- { "reward": "...", "penalty": "..." }
    status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 衝動制御ログ
CREATE TABLE impulse_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    resisted BOOLEAN NOT NULL,
    journal TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ユーザーが作成したチャレンジ
CREATE TABLE challenges (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100),
    discomfort_level TINYINT NOT NULL,
    is_template BOOLEAN DEFAULT FALSE, -- テンプレートかユーザー作成かを区別
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 達成したチャレンジの記録
CREATE TABLE completed_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id VARCHAR(36) NOT NULL,
    user_discomfort_level TINYINT NOT NULL,
    accomplishment TINYINT NOT NULL,
    takeaway TEXT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- マイ習慣
CREATE TABLE routines (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    discipline_mode JSON NULL, -- { "enabled": true, "time": "HH:MM", ... }
    victors_log JSON NULL, -- [{ "date": timestamp, "entry": "..." }]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- マイ習慣の構成ブロック
CREATE TABLE routine_blocks (
    id VARCHAR(36) PRIMARY KEY,
    routine_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL, -- 分単位
    `order` INT NOT NULL, -- ブロックの順序
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
);

-- 悪習慣
CREATE TABLE bad_habits (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    trigger_text TEXT NULL,
    replacement_action TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 悪習慣のログ
CREATE TABLE bad_habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bad_habit_id VARCHAR(36) NOT NULL,
    resisted BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bad_habit_id) REFERENCES bad_habits(id) ON DELETE CASCADE
);

-- ジャーナル（全種類を一つのテーブルで管理）
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    entry_type ENUM('cbt', 'free', 'impact') NOT NULL,
    content JSON NOT NULL, -- 各タイプ固有のデータをJSON形式で格納
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- シャドウワーク
CREATE TABLE shadow_journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    entry_type ENUM('daily_journey', 'reframing_failure') NOT NULL,
    content JSON NOT NULL, -- タイプ固有のデータをJSONで格納
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 信念ライブラリ
CREATE TABLE beliefs (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    original_text TEXT NOT NULL,
    rewritten_text TEXT NULL,
    status ENUM('uncovered', 'rewritten', 'accepted') NOT NULL DEFAULT 'uncovered',
    source_journal_day INT NULL, -- どのシャドウワークから来たか
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. 実装に向けた手順
データの永続化を実現するには、フロントエンドの改修だけでなく、バックエンド（APIサーバー）の構築が必要です。

### フェーズ1: バックエンド環境の構築
*   **技術選定:** サーバーサイドの言語とフレームワークを選定します。（例: Node.js + Express, Python + Django/FastAPI, Ruby on Railsなど）
*   **データベース接続:** 選択したフレームワークでMySQLデータベースに接続する設定を行います。
*   **テーブル作成:** 上記のCREATE TABLE文を基に、データベースマイグレーションツール（例: node-mysql-migrations, Flyway）を使ってテーブルを構築します。

### フェーズ2: APIの設計と実装
*   **認証:** ユーザー登録・ログイン機能を実装します。APIへのリクエストは認証トークン（例: JWT）で保護する必要があります。
*   **APIエンドポイント設計:** 各データリソースに対して、CRUD（作成, 読み取り, 更新, 削除）操作を行うためのRESTful APIエンドポイントを設計します。
    *   `GET /api/big-rocks`: 全てのBigRockを取得
    *   `POST /api/big-rocks`: 新しいBigRockを作成
    *   `PUT /api/big-rocks/:id`: 特定のBigRockを更新
    *   `DELETE /api/big-rocks/:id`: 特定のBigRockを削除
    *   （他のすべてのデータリソースに対しても同様のエンドポイントを設計）
*   **API実装:** 各エンドポイントに対応するロジック（データベースとのやり取り）を実装します。

### フェーズ3: フロントエンドの改修
*   **useLocalStorageフックの撤廃:** 現在データ管理に使用している`useLocalStorage`フックをすべて削除します。
*   **API通信層の作成:** バックエンドAPIと通信するための専用モジュール（クライアント）を作成します。`fetch`や`axios`ライブラリを利用します。
*   **データ取得ロジックの置き換え:** コンポーネントのマウント時（`useEffect`など）に、localStorageからデータを読み込む代わりにAPIを叩いてデータを取得するように変更します。状態管理ライブラリ（React Query, SWR, Redux Toolkitなど）の導入を強く推奨します。
*   **データ更新ロジックの置き換え:** `setBigRocks(...)` のように状態を直接更新していた部分を、対応するAPI（POST, PUT, DELETE）を呼び出す処理に置き換えます。API呼び出しが成功したら、UIの状態を更新します。

### フェーズ4: データ移行（任意だが推奨）
既存のユーザーがデータを失わないように、一度だけ実行する移行スクリプトを用意します。
1.  ユーザーがログインした際、localStorageに既存データがあるかチェックします。
2.  データが存在する場合、それをバックエンドの移行用エンドポイントに送信し、データベースに保存します。
3.  移行が完了したら、localStorageのデータを削除します。

### フェーズ5: デプロイ
*   バックエンドアプリケーションをサーバー（例: AWS, GCP, Vercelなど）にデプロイします。
*   フロントエンドアプリケーションをビルドし、ホスティングサービス（例: Vercel, Netlifyなど）にデプロイします。
*   データベースの接続情報やAPIキーなどの機密情報を環境変数として設定します。

## 5. 補足事項とベストプラクティス
*   **セキュリティ:** `shadowWorkPasscode`は必ずサーバーサイドでハッシュ化（例: bcrypt）してからデータベースに保存してください。平文での保存は絶対に避けるべきです。
*   **パフォーマンス:** `user_id`や日付関連のカラムにはインデックスを作成し、クエリのパフォーマンスを最適化します。
*   **トランザクション:** 複数のテーブルにまたがる更新処理（例: ジャーナルを書いて新しい習慣も作る場合）では、データベースのトランザクション機能を利用してデータの一貫性を保ちます。
*   **エラーハンドリング:** API通信におけるエラー（ネットワークエラー、サーバーエラーなど）を適切にハンドリングし、ユーザーにフィードバックする仕組みをフロントエンドに実装します。

以上が、アプリケーションのデータをMySQLに永続化するための設計案と実装計画です。このドキュメントを基に、バックエンド開発から着手することをお勧めします。