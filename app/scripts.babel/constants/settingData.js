import FormTypes from '../enums/FormTypes';

export default {
  key: 'setting',
  name: 'direct helper設定',
  description: `以下はdirect helperの設定です。設定変更後はページをリロードしてください。<br>
詳しい使用方法は<a href="https://github.com/munierujp/direct_helper/blob/master/README.md" target="_blank">readme</a>を参照してください。`,
  sections: [
    {
      key: 'user-dialog-settings',
      name: 'ユーザーダイアログ',
      description: 'ユーザーダイアログの動作を変更します。',
      items: [
        {
          key: 'expand_user_icon',
          name: 'ユーザーアイコンの拡大',
          description: 'ユーザーアイコンをクリックで拡大表示します。',
          type: FormTypes.CHECKBOX,
          default: true
        }
      ]
    },
    {
      key: 'talk-settings',
      name: '画像',
      description: '画像の動作を変更します。',
      items: [
        {
          key: 'change_thumbnail_size',
          name: 'サムネイルサイズの変更',
          description: '画像のサムネイルサイズを変更します。',
          type: FormTypes.CHECKBOX,
          default: false,
          experiment: true
        },
        {
          key: 'thumbnail_size',
          name: 'サムネイルサイズ',
          description: '画像のサムネイルサイズ（px）を入力してください。',
          type: FormTypes.NUMBER,
          default: 600,
          parentKey: 'change_thumbnail_size'
        },
        {
          key: 'blur_thumbnail',
          name: 'サムネイル画像をぼかす',
          description: 'サムネイル画像にブラー効果をかけてぼかします。',
          type: FormTypes.CHECKBOX,
          default: true
        },
        {
          key: 'thumbnail_blur_grade',
          name: 'ぼかし度',
          description: 'サムネイル画像のぼかし度（px）を入力してください。',
          type: FormTypes.NUMBER,
          default: 0,
          parentKey: 'blur_thumbnail'
        }
      ]
    },
    {
      key: 'input-message-settings',
      name: 'メッセージ入力',
      description: 'メッセージ入力欄の動作を変更します。',
      items: [
        {
          key: 'confirm_send_message_button',
          name: '送信ボタンの確認',
          description: '送信ボタンによるメッセージ送信前に確認します。',
          type: FormTypes.CHECKBOX,
          default: true
        },
        {
          key: 'show_message_count',
          name: '入力文字数の表示',
          description: '入力文字数を表示します。',
          type: FormTypes.CHECKBOX,
          default: true
        },
        {
          key: 'show_message_count_types',
          name: '入力文字数の表示形式',
          type: FormTypes.RADIOBUTTON,
          default: 'countdown',
          parentKey: 'show_message_count',
          buttons: [
            {
              key: 'countdown',
              name: 'カウントダウン'
            },
            {
              key: 'countup',
              name: 'カウントアップ'
            }
          ]
        }
      ]
    },
    {
      key: 'multi-view-settings',
      name: 'マルチビュー',
      description: 'マルチビューの動作を変更します。',
      items: [
        {
          key: 'responsive_multi_view',
          name: 'マルチビューのレスポンシブ化',
          description: '選択状態に応じてマルチビューのカラム数を動的に変更します。',
          type: FormTypes.CHECKBOX,
          default: false,
          experiment: true
        }
      ]
    },
    {
      key: 'message-watching-settings',
      name: 'メッセージ監視',
      description: 'メッセージを監視してコンソールに出力します。シングルビューでのみ動作します。',
      items: [
        {
          key: 'watch_message',
          name: 'メッセージの監視',
          description: 'メッセージを監視してコンソールに出力します。',
          type: FormTypes.CHECKBOX,
          default: true
        },
        {
          key: 'show_past_message',
          name: '過去メッセージの表示',
          description: '監視開始以前のメッセージを表示します。',
          type: FormTypes.CHECKBOX,
          default: false,
          parentKey: 'watch_message'
        },
        {
          key: 'watch_default_observe_talk',
          name: 'デフォルト監視対象の自動監視',
          description: 'デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。',
          type: FormTypes.CHECKBOX,
          default: true,
          parentKey: 'watch_message'
        },
        {
          key: 'default_observe_talk_ids',
          name: 'デフォルト監視トークID',
          description: 'HTMLのid属性のうち、"talk-_"で始まるものを半角カンマ区切りで入力してください。',
          type: FormTypes.TEXT_ARRAY,
          default: [],
          parentKey: 'watch_default_observe_talk'
        }
      ]
    },
    {
      key: 'log-settings',
      name: 'ログ',
      description: 'ログの表示形式をカスタマイズします。',
      items: [
        {
          key: 'log_label',
          name: 'ログラベル',
          description: 'コンソールでのフィルター用の文字列です。',
          type: FormTypes.TEXT,
          default: ''
        },
        {
          type: FormTypes.TEXT,
          name: 'システムユーザー名',
          key: 'user_name_system',
          default: 'システム'
        },
        {
          key: 'log_stamp',
          name: 'スタンプログ',
          type: FormTypes.TEXT,
          default: '[スタンプ]'
        },
        {
          key: 'log_image',
          name: '画像ログ',
          type: FormTypes.TEXT,
          default: '[画像]'
        },
        {
          key: 'log_file',
          name: 'ファイルログ',
          type: FormTypes.TEXT,
          default: '[ファイル]'
        },
        {
          key: 'date_format',
          name: '日付フォーマット',
          description: 'パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss',
          type: FormTypes.TEXT,
          default: 'yyyy/M/d(e) HH:mm:ss'
        },
        {
          key: 'custom_log_start_observe_messages',
          name: 'メッセージ監視開始文',
          description: '&lt;time&gt;:監視開始日時',
          type: FormTypes.TEXT,
          default: '<time> メッセージの監視を開始します。'
        },
        {
          key: 'custom_log_start_observe_talk',
          name: 'トーク監視開始文',
          description: '&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時',
          type: FormTypes.TEXT,
          default: '<time> [<talkName>]の監視を開始します。'
        },
        {
          key: 'custom_log_message_header',
          name: 'メッセージヘッダー',
          description: '&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名',
          type: FormTypes.TEXT,
          default: '<time> [<talkName>] <userName>'
        }
      ]
    }
  ]
};
