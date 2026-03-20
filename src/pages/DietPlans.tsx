import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Apple, Search, ChevronDown, Leaf, Flame, Wheat, Droplets, Brain } from 'lucide-react'
import { askGemini } from '../utils/gemini'

const dietPlans = [
  {
    disease: 'Diabetes (Type 2)', icon: '🩸', calories: '1500–1800 kcal/day',
    nutrients: { fiber: '30g', protein: '60–80g', carbs: '130–150g', fat: '50–60g' },
    foods: {
      eat: ['Leafy greens (spinach, kale, methi)', 'Whole grains (brown rice, oats, ragi)', 'Fatty fish (salmon, mackerel)', 'Nuts & seeds (almonds, flaxseeds)', 'Berries & citrus fruits', 'Legumes (lentils, chickpeas, rajma)', 'Greek yogurt (unsweetened)', 'Bitter gourd (karela)', 'Fenugreek seeds'],
      avoid: ['White bread & maida products', 'Sugary drinks & packaged juices', 'Fried foods (samosa, puri)', 'Processed snacks (biscuits, chips)', 'White rice in excess', 'Candy, mithai & desserts', 'Fruit juice (even fresh)', 'Potatoes in excess'],
    },
    tips: 'Eat at regular 3-hour intervals. Monitor carb intake carefully. Include 30 min daily walk. Check HbA1c every 3 months.',
    color: 'var(--teal)',
  },
  {
    disease: 'Hypertension', icon: '❤️', calories: '1800–2000 kcal/day',
    nutrients: { fiber: '30g', protein: '70–90g', carbs: '200–250g', fat: '50–65g' },
    foods: {
      eat: ['Bananas & potassium-rich fruits', 'Dark leafy vegetables', 'Low-fat dairy (buttermilk, curd)', 'Whole grains (jowar, bajra)', 'Lean poultry & fish', 'Garlic & herbs', 'Beets & berries', 'Coconut water (natural electrolytes)'],
      avoid: ['Salt & salty snacks (namkeen, papad)', 'Processed meats (sausage, salami)', 'Canned & packaged soups', 'Pickled foods (achaar, pickles)', 'Alcohol in excess', 'Caffeine excess', 'Red meat daily'],
    },
    tips: 'Follow DASH diet. Reduce sodium to under 2300mg/day. Exercise 30 min/day. Manage stress with yoga/meditation.',
    color: 'var(--coral)',
  },
  {
    disease: 'Heart Disease', icon: '🫀', calories: '1800–2200 kcal/day',
    nutrients: { fiber: '25–30g', protein: '70g', carbs: '225–300g', fat: '60–75g' },
    foods: {
      eat: ['Omega-3 rich fish (salmon, sardines, tuna)', 'Olive oil & mustard oil', 'Avocados', 'Walnuts & almonds', 'Whole grains & oats', 'Berries & dark chocolate (>70%)', 'Green tea', 'Flaxseeds & chia seeds'],
      avoid: ['Trans fats & vanaspati', 'Red meat daily', 'Full-fat dairy in excess', 'Fried & deep fried foods', 'Sugary desserts & sweets', 'Excess salt', 'Coconut oil excess', 'Refined flour products'],
    },
    tips: 'Mediterranean diet strongly recommended. Include 2 servings of fish/week. Quit smoking. Limit saturated fat to under 7% of calories.',
    color: 'var(--coral)',
  },
  {
    disease: 'Kidney Disease (CKD)', icon: '🫘', calories: '1600–2000 kcal/day',
    nutrients: { fiber: '20g', protein: '40–60g', carbs: '200–250g', fat: '50–60g' },
    foods: {
      eat: ['Cauliflower & cabbage (low potassium)', 'Blueberries & cranberries', 'Fish in small portions', 'Egg whites (not yolk)', 'Garlic & onions', 'Red bell peppers', 'Olive oil', 'White rice (leached)'],
      avoid: ['High-sodium packaged foods', 'Bananas & oranges (high potassium)', 'Dairy in excess (phosphorus)', 'Nuts & seeds in excess', 'Dark colas (phosphorus)', 'Whole grains in late-stage CKD', 'Tomatoes & potatoes in excess'],
    },
    tips: 'Monitor fluid intake strictly. Limit potassium & phosphorus. Low protein in late stages. Nephrologist consult monthly.',
    color: 'var(--amber)',
  },
  {
    disease: 'PCOD / PCOS', icon: '🌸', calories: '1400–1800 kcal/day',
    nutrients: { fiber: '28g', protein: '60–80g', carbs: '130–170g', fat: '45–60g' },
    foods: {
      eat: ['Anti-inflammatory foods (turmeric, ginger)', 'High-fiber vegetables (broccoli, cauliflower)', 'Lean protein (chicken, fish, tofu)', 'Berries & tart cherries', 'Sweet potatoes (low GI)', 'Quinoa & millets', 'Leafy greens', 'Spearmint tea'],
      avoid: ['Refined carbs & maida', 'Sugary beverages & juices', 'Processed junk food', 'White bread & pasta', 'Dairy in excess (some women)', 'Soy in excess', 'Trans fats & fried foods'],
    },
    tips: 'Anti-inflammatory diet essential. Regular exercise (HIIT + strength). Maintain healthy BMI. Consider Vitamin D & Inositol supplements.',
    color: '#7F77DD',
  },
  {
    disease: 'Thyroid (Hypothyroidism)', icon: '🦋', calories: '1600–2000 kcal/day',
    nutrients: { fiber: '25g', protein: '60–70g', carbs: '200–250g', fat: '50–60g' },
    foods: {
      eat: ['Iodine-rich foods (seaweed, iodised salt, fish)', 'Selenium foods (Brazil nuts, eggs, sunflower seeds)', 'Zinc-rich foods (chickpeas, pumpkin seeds)', 'Fruits & colorful vegetables', 'Lean meats & poultry', 'Dairy (calcium)', 'Whole grains'],
      avoid: ['Soy products in excess', 'Raw cruciferous veg (broccoli, cabbage, kale)', 'Gluten (for Hashimoto\'s)', 'Processed & junk food', 'Coffee near medication time', 'Calcium supplements with medication', 'Excess fiber supplements'],
    },
    tips: 'Take levothyroxine on empty stomach. Wait 30–60 min before eating. Regular TSH monitoring every 6 weeks.',
    color: 'var(--emerald)',
  },
  {
    disease: 'Anaemia (Iron Deficiency)', icon: '🩺', calories: '1800–2100 kcal/day',
    nutrients: { fiber: '25g', protein: '70–90g', carbs: '220–280g', fat: '50–65g' },
    foods: {
      eat: ['Red meat & organ meats (liver, kidney)', 'Spinach, palak, methi', 'Legumes (lentils, kidney beans)', 'Fortified cereals', 'Pumpkin seeds & sesame', 'Vitamin C rich foods (amla, guava, citrus)', 'Jaggery (gud)', 'Drumstick (moringa) leaves'],
      avoid: ['Tea & coffee with meals (blocks iron)', 'Calcium-rich foods with iron-rich meals', 'Phytate-rich foods (bran in excess)', 'Alcohol', 'Antacids near meals'],
    },
    tips: 'Pair iron-rich foods with Vitamin C for better absorption. Avoid tea/coffee for 1 hour after iron-rich meals. Ferritin target: >30 ng/mL.',
    color: '#f472b6',
  },
  {
    disease: 'Obesity / Weight Loss', icon: '⚖️', calories: '1200–1600 kcal/day',
    nutrients: { fiber: '35g', protein: '80–100g', carbs: '100–150g', fat: '40–55g' },
    foods: {
      eat: ['High-fiber vegetables (cucumber, lettuce, capsicum)', 'Lean protein (egg white, chicken breast, fish)', 'Whole fruits (not juice)', 'Legumes & lentils', 'Green tea & black coffee', 'Greek yogurt', 'Millets & brown rice (small portions)', 'Nuts in moderation'],
      avoid: ['Sugar-sweetened beverages', 'Ultra-processed foods', 'Refined carbs & white bread', 'Fried & fast food', 'Full-fat dairy excess', 'Alcohol', 'Fruit juice', 'Late-night eating'],
    },
    tips: 'Create 500 kcal daily deficit. Eat slowly — takes 20 min for satiety signal. Strength training 3x/week builds metabolic rate.',
    color: 'var(--amber)',
  },
]

export default function DietPlans() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState('')
  const [aiFor, setAiFor] = useState('')

  const filtered = dietPlans.filter(d =>
    d.disease.toLowerCase().includes(search.toLowerCase())
  )

  const getAIPlan = async (disease: string) => {
    setAiLoading(true)
    setAiFor(disease)
    try {
      const result = await askGemini(
        `Create a detailed 7-day meal plan for an Indian patient with ${disease}. Include breakfast, lunch, dinner, and 2 snacks per day. Use common Indian foods. Include calorie count per day. Format clearly with Day 1, Day 2, etc.`
      )
      setAiPlan(result)
    } catch {
      setAiPlan('Could not generate AI meal plan. Check VITE_GEMINI_API_KEY in .env')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(29,158,117,0.2)' }}>
            <Apple className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Disease-Specific Diet Plans</h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Evidence-based nutrition · Indian food focus · Gemini AI meal planner</p>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by disease (e.g. diabetes, PCOS)..."
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((plan, i) => (
          <motion.div key={plan.disease}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl overflow-hidden cursor-pointer transition-all"
            style={{ border: selected === i ? `2px solid ${plan.color}` : '1px solid var(--border)' }}
            onClick={() => setSelected(selected === i ? null : i)}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{plan.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{plan.disease}</h3>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{plan.calories}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform"
                  style={{ color: 'var(--text3)', transform: selected === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </div>

              {/* Nutrient badges */}
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(29,158,117,0.1)', color: '#0F6E56' }}>
                  <Leaf className="w-3 h-3" />{plan.nutrients.fiber} fiber
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(216,90,48,0.1)', color: '#993C1D' }}>
                  <Flame className="w-3 h-3" />{plan.nutrients.protein} protein
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(186,117,23,0.1)', color: '#854F0B' }}>
                  <Wheat className="w-3 h-3" />{plan.nutrients.carbs} carbs
                </span>
              </div>

              <AnimatePresence>
                {selected === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3" style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#0F6E56' }}>✅ Eat these</p>
                        {plan.foods.eat.map(f => (
                          <p key={f} className="text-xs mb-1" style={{ color: 'var(--text2)' }}>• {f}</p>
                        ))}
                      </div>
                      <div className="rounded-lg p-3" style={{ background: 'rgba(216,90,48,0.06)', border: '1px solid rgba(216,90,48,0.2)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#993C1D' }}>❌ Avoid these</p>
                        {plan.foods.avoid.map(f => (
                          <p key={f} className="text-xs mb-1" style={{ color: 'var(--text2)' }}>• {f}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'rgba(0,200,160,0.05)', border: '1px solid var(--border)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--teal)' }}>💡 Clinical tips</p>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>{plan.tips}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); getAIPlan(plan.disease) }}
                      disabled={aiLoading && aiFor === plan.disease}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'var(--gradient-primary)' }}>
                      <Brain className="w-4 h-4" />
                      {aiLoading && aiFor === plan.disease ? 'Generating 7-day plan...' : 'Get AI 7-day Meal Plan (Indian foods)'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {aiPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
            AI-Generated 7-Day Meal Plan — {aiFor}
          </h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            {aiPlan}
          </div>
        </motion.div>
      )}
    </div>
  )
}