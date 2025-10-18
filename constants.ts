// FIX: Add .ts extension to import to resolve module.
import { Challenge, Routine, Habit7Id } from './types.ts';

export const HABIT_TEMPLATES: Routine[] = [
    {
        id: 'template-morning',
        name: '朝の生産性習慣',
        blocks: [
            { id: 'tmb1', title: '水分補給', duration: 5 },
            { id: 'tmb2', title: '瞑想', duration: 10 },
            { id: 'tmb3', title: '軽い運動', duration: 15 },
            { id: 'tmb4', title: '今日の目標設定', duration: 10 },
        ]
    },
    {
        id: 'template-evening',
        name: '夜のリラックス習慣',
        blocks: [
            { id: 'teb1', title: 'デジタルデトックス', duration: 30 },
            { id: 'teb2', title: '読書', duration: 20 },
            { id: 'teb3', title: 'ジャーナリング', duration: 10 },
            { id: 'teb4', title: '明日の準備', duration: 15 },
        ]
    }
];

export const CHALLENGE_TEMPLATES: Challenge[] = [
    {
        id: 'template-challenge-1',
        title: 'スクリーンタイムを3時間以内に',
        description: 'スマートフォンの使用時間を1日合計3時間未満に抑え、デジタルデトックスを実践する。',
        category: 'デジタルデトックス',
        discomfortLevel: 3
    },
    {
        id: 'template-challenge-2',
        title: '朝8時半までにモーニングワーク',
        description: '朝の最も集中できるゴールデンタイムを使って、最重要タスクに手をつける。',
        category: '生産性',
        discomfortLevel: 2
    },
    {
        id: 'template-challenge-3',
        title: '朝6時半起床と30分の散歩',
        description: '早起きして新鮮な空気を吸い、セロトニンを活性化させ、心と体をリフレッシュさせる。',
        category: '健康・ウェルネス',
        discomfortLevel: 4
    },
    {
        id: 'template-challenge-4',
        title: '1時間ごとに5分間の運動',
        description: 'デスクワーク中に血行を促進し、集中力を維持する。スクワットやストレッチなどを行う。',
        category: '健康・運動',
        discomfortLevel: 2
    },
    {
        id: 'template-challenge-5',
        title: '夜は自分のための創作活動',
        description: 'クライアントワークや受動的なSNS消費ではなく、自分のための創造的なプロジェクトに時間を使う。',
        category: '自己投資・創造性',
        discomfortLevel: 3
    }
];


export const SHADOW_WORK_DAY_1_QUESTIONS: string[] = [
    "あなたが他人から隠そうとしている自分の一部は何ですか？ それはなぜですか？",
    "強烈な嫉妬を感じた時のことを説明してください。その感情は、あなた自身の願望や不安について何を教えてくれましたか？",
    "あなたの人生で繰り返されるネガティブなパターンは何ですか？ それはどこから来ていると思いますか？",
    "あなたが怒りを感じる時、その下にある根本的な感情（例：傷心、恐怖、不正義感）は何ですか？",
    "あなたが抱える人生の大きな後悔は何ですか？ もし過去の自分に話しかけることができたら、何を伝えますか？",
];

export const SEVEN_HABITS_DETAILS: { id: Habit7Id; title: string; chartLabel: string[]; description: string; actionExample: string; }[] = [
    {
        id: 'exceed_expectations',
        title: '常に期待を超える',
        chartLabel: ['常に', '期待を超える'],
        description: '求められたことをこなすだけでなく、常により多くの価値を提供しようと努める。相手のニーズを先読みし、驚きと喜びを与える成果を目指す。',
        actionExample: '会議資料に、想定される質問への回答を追記しておく。'
    },
    {
        id: 'master_reliability',
        title: '信頼性の技術を習得する',
        chartLabel: ['信頼性の技術を', '習得する'],
        description: '言ったことを必ず実行し、約束を守る。一貫性があり、困難な状況でも頼りになる存在となることで、信頼という最も重要な資産を築く。',
        actionExample: '依頼されたタスクの進捗を、聞かれる前に報告する。'
    },
    {
        id: 'growth_mindset',
        title: '成長志向のマインドセット',
        chartLabel: ['成長志向の', 'マインドセット'],
        description: '自分の能力は努力と学習によって無限に伸ばせると信じる。挑戦を成長の機会と捉え、あらゆる経験から学ぶ姿勢を持つ。',
        actionExample: 'フィードバックを真摯に受け止め、感謝を伝える。'
    },
    {
        id: 'master_communication',
        title: '効果的なコミュニケーション',
        chartLabel: ['効果的な', 'コミュニケーション'],
        description: '話すこと以上に、深く聴くことを重視する。共感を持って相手を理解し、自分の考えは明確かつ簡潔に伝えることで、誤解のない円滑な関係を築く。',
        actionExample: '相手の話を遮らず、最後まで聴いてから質問する。'
    },
    {
        id: 'commit_to_growth',
        title: '自己成長へのコミットメント',
        chartLabel: ['自己成長への', 'コミットメント'],
        description: '現状に満足せず、精神的、感情的、技術的に自分を向上させ続けることを人生の最優先事項とする。',
        actionExample: 'いつもと違うジャンルの本を15分読む。'
    },
    {
        id: 'build_relationships',
        title: '有意義な人間関係を築く',
        chartLabel: ['有意義な', '人間関係を築く'],
        description: '誠実さ、共感、寛大さに基づいた、本物の関係性を構築し、長期的に育んでいく。',
        actionExample: '同僚の小さな成功を、具体的に褒めて祝福する。'
    },
    {
        id: 'master_adaptability',
        title: '適応能力を習得する',
        chartLabel: ['適応能力を', '習得する'],
        description: '変化を脅威ではなく、成長と革新の機会として受け入れる。古いやり方に固執せず、状況に応じて柔軟に考え、行動する。',
        actionExample: '急な計画変更に対し、不満を言う前に代替案を考える。'
    }
];