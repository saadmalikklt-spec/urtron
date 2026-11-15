import React, { useState } from 'react';
import { Smile, Image as ImageIcon, Search, Zap, Heart, Bot } from 'lucide-react';

interface EmojiGifPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (gifUrl: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Empathy & Warmth',
    icon: Heart,
    emojis: ['🤗', '❤️', '🫂', '💖', '🥺', '😌', '🕊️', '✨', '🌸', '🙏', '😊', '🥰', '💫', '☀️'],
  },
  {
    name: 'Ultron & Tech',
    icon: Bot,
    emojis: ['🤖', '⚡', '🧠', '🔮', '🦾', '🛡️', '🧬', '🚀', '🛸', '🌐', '🪐', '💻', '📡', '⚙️'],
  },
  {
    name: 'Reactions & Victory',
    icon: Zap,
    emojis: ['🔥', '👏', '🎯', '💡', '💎', '🏆', '👑', '💯', '🌟', '🎉', '💪', '🤝', '🙌', '✨'],
  },
];

// Curated high-tech & expressive animated GIFs (Giphy & Tenor CDN safe links)
const CURATED_GIFS = [
  {
    id: 'ultron_energy',
    title: 'Ultron Prime Awakening',
    category: 'ultron',
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    thumb: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/200w.gif',
  },
  {
    id: 'ai_neural_grid',
    title: 'Neural Network Core',
    category: 'ai',
    url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    thumb: 'https://media.giphy.com/media/13HgwGsXF0aiGY/200w.gif',
  },
  {
    id: 'cyber_hologram',
    title: 'Holographic Analysis',
    category: 'tech',
    url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    thumb: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/200w.gif',
  },
  {
    id: 'warm_empathy',
    title: 'Support & Warmth',
    category: 'empathy',
    url: 'https://media.giphy.com/media/5OqXb948EBkyUcnw70/giphy.gif',
    thumb: 'https://media.giphy.com/media/5OqXb948EBkyUcnw70/200w.gif',
  },
  {
    id: 'iron_victory',
    title: 'Victory & Power',
    category: 'victory',
    url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    thumb: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/200w.gif',
  },
  {
    id: 'deep_thinking',
    title: 'Hyper-Computation',
    category: 'thinking',
    url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    thumb: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/200w.gif',
  },
  {
    id: 'spark_celebrate',
    title: 'Cosmic Celebration',
    category: 'celebration',
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    thumb: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/200w.gif',
  },
  {
    id: 'neon_reactor',
    title: 'Arc Reactor Pulse',
    category: 'ultron',
    url: 'https://media.giphy.com/media/3ohhwF34cGDoFFhRfy/giphy.gif',
    thumb: 'https://media.giphy.com/media/3ohhwF34cGDoFFhRfy/200w.gif',
  },
];

export const EmojiGifPicker: React.FC<EmojiGifPickerProps> = ({
  onSelectEmoji,
  onSelectGif,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>('emoji');
  const [gifSearch, setGifSearch] = useState('');

  const filteredGifs = CURATED_GIFS.filter(
    (g) =>
      g.title.toLowerCase().includes(gifSearch.toLowerCase()) ||
      g.category.toLowerCase().includes(gifSearch.toLowerCase())
  );

  return (
    <div className="w-80 sm:w-96 rounded-2xl border border-slate-700 bg-[#090d18]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-150">
      {/* Tabs */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('emoji')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'emoji'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Emojis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gif')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'gif'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Interactive GIFs</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs p-1"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-3 max-h-72 overflow-y-auto">
        {activeTab === 'emoji' ? (
          <div className="space-y-3">
            {EMOJI_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.name}>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                    <Icon className="w-3 h-3 text-yellow-400" />
                    <span>{cat.name}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cat.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onSelectEmoji(emoji);
                          onClose();
                        }}
                        className="w-9 h-9 flex items-center justify-center text-lg hover:bg-slate-800/80 rounded-lg transition-transform active:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                placeholder="Search GIFs (Ultron, Empathy, AI, Victory)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-yellow-400/80 transition-all aspect-video bg-slate-900"
                >
                  <img
                    src={gif.thumb}
                    alt={gif.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">
                      {gif.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
