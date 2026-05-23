import { Button, Divider, Form, Select } from 'antd'
import { useState } from 'react'

const optionGroups = [
  {
    value: 'genre',
    label: '音乐流派',
    children: [
      { value: 'chinese pop', label: '华语流行' },
      { value: 'western pop', label: '欧美流行' },
      { value: 'rnb', label: 'R&B' },
      { value: 'hiphop', label: '嘻哈/说唱' },
      { value: 'rock', label: '摇滚' },
      { value: 'folk', label: '民谣' },
      { value: 'chinese style', label: '古风/国风' },
      { value: 'electronic', label: '电子' },
      { value: 'edm', label: 'EDM' },
      { value: 'house', label: 'House' },
      { value: 'techno', label: 'Techno' },
      { value: 'lofi', label: 'Lo-fi' },
      { value: 'jazz', label: '爵士' },
      { value: 'blues', label: '布鲁斯' },
      { value: 'classical', label: '古典' },
      { value: 'light music', label: '轻音乐' },
      { value: 'metal', label: '金属' },
      { value: 'punk', label: '朋克' },
      { value: 'country', label: '乡村' },
      { value: 'latin', label: '拉丁' },
      { value: 'reggae', label: '雷鬼' },
      { value: 'k-pop', label: 'K-Pop' },
      { value: 'j-pop', label: 'J-Pop' },
      { value: 'phonk', label: 'Phonk' },
      { value: 'opera chinese', label: '国风戏腔' },
      { value: 'vaporwave', label: '蒸汽波' },
      { value: 'disco', label: '迪斯科' },
      { value: 'funk', label: '放克' },
    ],
  },
  {
    value: 'mood',
    label: '情感氛围',
    children: [
      { value: 'happy', label: '欢快' },
      { value: 'sad', label: '悲伤' },
      { value: 'heal', label: '治愈' },
      { value: 'excited', label: '激昂' },
      { value: 'soothing', label: '舒缓' },
      { value: 'romantic', label: '浪漫' },
      { value: 'lonely', label: '孤独' },
      { value: 'passionate', label: '热血' },
      { value: 'melancholy', label: '忧郁' },
      { value: 'lazy', label: '慵懒' },
      { value: 'mysterious', label: '神秘' },
      { value: 'epic', label: '史诗' },
      { value: 'fresh', label: '清新' },
      { value: 'nostalgic', label: '怀旧' },
      { value: 'ethereal', label: '空灵' },
      { value: 'nervous', label: '紧张' },
      { value: 'relaxed', label: '放松' },
      { value: 'sweet', label: '甜美' },
      { value: 'cool', label: '酷飒' },
      { value: 'gentle', label: '温柔' },
      { value: 'dark', label: '暗黑' },
      { value: 'sunny', label: '阳光' },
      { value: 'confused', label: '迷茫' },
      { value: 'firm', label: '坚定' },
      { value: 'relieved', label: '释然' },
    ],
  },
  {
    value: 'instrument',
    label: '乐器组合',
    children: [
      { value: 'piano solo', label: '钢琴独奏' },
      { value: 'guitar piano', label: '吉他+钢琴' },
      { value: 'band', label: '乐队编制 (鼓+贝斯+吉他+键盘)' },
      { value: 'orchestra', label: '管弦乐 (弦乐+木管+铜管)' },
      { value: 'chinese instrument', label: '民乐组合 (古筝+二胡+笛子)' },
      { value: 'synth 808', label: '合成器+808鼓' },
      { value: 'jazz trio', label: '爵士三重奏 (钢琴+贝斯+鼓)' },
      { value: 'acapella', label: '无乐器/纯人声' },
      { value: 'acoustic', label: '原声乐器组合' },
      { value: 'electronic inst', label: '电子乐器组合' },
      { value: 'string quartet', label: '弦乐四重奏' },
      { value: 'ethnic drum', label: '民族打击乐' },
      { value: 'rock basic', label: '摇滚三大件 (电吉他+贝斯+架子鼓)' },
      { value: 'chinese pluck', label: '古风弹拨乐组合' },
    ],
  },
  {
    value: 'bpm',
    label: 'BPM节奏',
    children: [
      { value: 'bpm 160', label: '160bpm' },
      { value: 'bpm 130', label: '130bpm' },
      { value: 'bpm 120', label: '120bpm' },
      { value: 'bpm 90', label: '90bpm' },
      { value: 'bpm 60', label: '60bpm' },
      { value: 'fast', label: '快速' },
      { value: 'very fast', label: '超快' },
      { value: 'slow', label: '慢速' },
      { value: 'leisure', label: '悠闲' },
      { value: 'syncopation', label: '切分音' },
      { value: 'shuffle', label: 'Shuffle' },
      { value: 'breakbeat', label: 'Breakbeat' },
      { value: 'big beat', label: '大节拍' },
      { value: 'trance', label: 'Trance节奏' },
      { value: 'reggae', label: '雷鬼顿节奏' },
      { value: 'salsa', label: '萨尔萨节奏' },
      { value: 'afrobeat', label: 'Afrobeat节奏' },
      { value: 'jazz swing', label: '爵士摇摆' },
      { value: 'funk groove', label: '放克律动' },
    ],
  },
  {
    value: 'time signature',
    label: '拍号',
    children: [
      { value: '4/4', label: '4/4拍 (常见流行/摇滚)' },
      { value: '3/4', label: '3/4拍 (华尔兹)' },
      { value: '6/8', label: '6/8拍 (民谣/抒情)' },
      { value: '2/4', label: '2/4拍 (进行曲)' },
      { value: '5/4', label: '5/4拍 (特殊节奏)' },
      { value: '7/8', label: '7/8拍 (非常规节奏)' },
      { value: 'auto', label: '自动适配' },
    ],
  },
  {
    value: 'vocal style',
    label: '语音风格',
    children: [
      { value: 'neutral pop', label: '中性流行' },
      { value: 'soft female', label: '温柔女声' },
      { value: 'magnetic male', label: '磁性男声' },
      { value: 'smoky voice', label: '烟嗓' },
      { value: 'child voice', label: '童声' },
      { value: 'opera voice', label: '戏腔' },
      { value: 'rap', label: '说唱' },
      { value: 'opera', label: '美声' },
      { value: 'folk sing', label: '民谣弹唱' },
      { value: 'breathy voice', label: '气声' },
      { value: 'rnb riff', label: 'R&B转音' },
      { value: 'rock scream', label: '摇滚嘶吼' },
      { value: 'jazz voice', label: '慵懒爵士嗓' },
      { value: 'dialect', label: '方言演唱 (粤语/川渝等)' },
      { value: 'hum', label: '无歌词哼唱' },
      { value: 'pure music', label: '纯音乐 (无人声)' },
    ],
  },
  {
    value: 'mode',
    label: '调式',
    children: [
      { value: 'C major', label: 'C大调' },
      { value: 'G major', label: 'G大调' },
      { value: 'D major', label: 'D大调' },
      { value: 'A major', label: 'A大调' },
      { value: 'E major', label: 'E大调' },
      { value: 'F major', label: 'F大调' },
      { value: 'Bb major', label: '降B大调' },
      { value: 'a minor', label: 'a小调' },
      { value: 'e minor', label: 'e小调' },
      { value: 'b minor', label: 'b小调' },
      { value: 'd minor', label: 'd小调' },
      { value: 'g minor', label: 'g小调' },
      { value: 'harmonic minor', label: '和声小调' },
      { value: 'pentatonic', label: '五声调式 (宫商角徵羽)' },
      { value: 'blues mode', label: '布鲁斯调式' },
      { value: 'dorian', label: '多利亚调式' },
      { value: 'mixolydian', label: '混合利底亚调式' },
      { value: 'auto mode', label: '自动适配' },
    ],
  },
  {
    value: 'language',
    label: '语言',
    children: [
      { value: 'chinese', label: '普通话' },
      { value: 'cantonese', label: '粤语' },
      { value: 'english', label: '英语' },
      { value: 'japanese', label: '日语' },
      { value: 'korean', label: '韩语' },
    ],
  },
]

export default function PromptCreator() {
  const [form] = Form.useForm()
  const [prompts, setPrompts] = useState<string>('')

  const onFinish = (values: { [key: string]: string[] }) => {
    console.log('Selected options:', values)
    const prompts = Object.values(values).flat().join(', ')
    console.log(`生成的提示词: ${prompts}`)
    setPrompts(prompts)
  }

  return (
    <>
      <section className='min-h-screen bg-mist-900 p-4'>
        <div className='mx-auto w-3xl max-w-full'>
          <Form layout='vertical' form={form} onFinish={onFinish}>
            {optionGroups.map((group) => {
              return (
                <Form.Item key={group.value} name={group.value} label={group.label}>
                  <Select mode='multiple' options={group.children} className='w-full' allowClear />
                </Form.Item>
              )
            })}

            <Button type='primary' htmlType='submit'>
              生成提示词
            </Button>
          </Form>

          <Divider />
          <p className='m-4 text-white'>{prompts}</p>
        </div>
      </section>
    </>
  )
}
