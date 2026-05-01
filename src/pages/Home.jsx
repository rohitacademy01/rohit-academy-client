import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Download, Star, ArrowRight, Users, TrendingUp, Shield, ChevronRight } from "lucide-react";
import API from "../services/api";

function Home() {
  const [featuredBatches, setFeaturedBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await API.get("/batches?featured=true&limit=6");
        setFeaturedBatches(res.data?.batches || []);
      } catch {
        setFeaturedBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const classes = [
    { name: "Class 9", route: "/classes/9", icon: "9️⃣", color: "from-blue-500 to-cyan-500" },
    { name: "Class 10", route: "/classes/10", icon: "🔟", color: "from-indigo-500 to-blue-600" },
    { name: "Class 11", route: "/classes/11", icon: "📗", color: "from-purple-500 to-indigo-600", hasStreams: true },
    { name: "Class 12", route: "/classes/12", icon: "📘", color: "from-pink-500 to-rose-600", hasStreams: true },
    { name: "BA", route: "/batches?class=BA", icon: "🎓", color: "from-orange-500 to-amber-500", soon: true },
    { name: "BSc", route: "/batches?class=BSc", icon: "🔬", color: "from-green-500 to-emerald-600", soon: true },
    { name: "BCom", route: "/batches?class=BCom", icon: "📊", color: "from-teal-500 to-cyan-600", soon: true },
  ];

  const stats = [
    { value: "10,000+", label: "Students", icon: <Users size={24} /> },
    { value: "500+", label: "PDF Notes", icon: <FileText size={24} /> },
    { value: "50+", label: "Batches", icon: <BookOpen size={24} /> },
    { value: "4.9★", label: "Rating", icon: <Star size={24} /> },
  ];

  const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-16 pb-16">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20 px-8 text-center">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-64 h-64 rounded-full bg-white/10"
              style={{ top: `${(i * 30) % 80}%`, left: `${(i * 25) % 90}%`, transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🎓 India's Best PDF Study Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Master Every Subject with <span className="text-yellow-300">Premium Notes</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Class 9 to 12 + BA, BSc, BCom. PCM, PCB, Arts. Expert-crafted PDFs for exam success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/batches"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Browse Batches <ArrowRight size={20} />
            </Link>
            <Link to="/classes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/30 transition">
              All Classes
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="text-blue-600 flex justify-center mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURED BATCHES */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Batches</h2>
            <p className="text-gray-500 mt-1">Most popular study packages</p>
          </div>
          <Link to="/batches" className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loadingBatches ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : featuredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBatches.map((batch) => (
              <BatchCard key={batch._id} batch={batch} formatPrice={formatPrice} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 font-medium">Batches coming soon! Check back later.</p>
          </div>
        )}
      </section>

      {/* CLASS GRID */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Class</h2>
          <p className="text-gray-500">Select your class to explore study materials</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {classes.map((cls) => (
            <Link key={cls.name} to={cls.route}
              className={`relative rounded-2xl p-5 text-center font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${cls.color} ${cls.soon ? 'opacity-70 cursor-default' : ''}`}>
              <div className="text-2xl mb-2">{cls.icon}</div>
              <div className="text-sm font-semibold">{cls.name}</div>
              {cls.hasStreams && <div className="text-xs opacity-80 mt-1">PCM · PCB · Arts</div>}
              {cls.soon && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* STREAM SECTION */}
      <section className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Class 11 & 12 Streams</h2>
          <p className="text-gray-500">Choose your stream for subject-wise notes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "PCM", desc: "Physics · Chemistry · Maths", icon: "⚗️", gradient: "from-blue-500 to-indigo-600",
              links: [{ label: "Class 11 PCM", to: "/batches?stream=PCM&class=11" }, { label: "Class 12 PCM", to: "/batches?stream=PCM&class=12" }] },
            { name: "PCB (Bio)", desc: "Physics · Chemistry · Biology", icon: "🧬", gradient: "from-green-500 to-emerald-600",
              links: [{ label: "Class 11 PCB", to: "/batches?stream=PCB&class=11" }, { label: "Class 12 PCB", to: "/batches?stream=PCB&class=12" }] },
            { name: "Arts", desc: "History · Geography · Civics", icon: "🎭", gradient: "from-orange-500 to-pink-600",
              links: [{ label: "Class 11 Arts", to: "/batches?stream=Arts&class=11" }, { label: "Class 12 Arts", to: "/batches?stream=Arts&class=12" }] },
          ].map((stream) => (
            <div key={stream.name} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stream.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {stream.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{stream.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{stream.desc}</p>
              <div className="space-y-2">
                {stream.links.map((link) => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition text-sm font-medium">
                    {link.label} <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Rohit Academy?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <BookOpen className="text-blue-500" size={28} />, title: "Expert-Crafted Notes", desc: "Prepared by top educators with exam focus", bg: "bg-blue-50" },
            { icon: <FileText className="text-green-500" size={28} />, title: "Sample Papers", desc: "Practice with real exam-pattern questions", bg: "bg-green-50" },
            { icon: <Download className="text-orange-500" size={28} />, title: "Instant PDF Access", desc: "Download anytime after purchase", bg: "bg-orange-50" },
            { icon: <Shield className="text-purple-500" size={28} />, title: "Secure Payments", desc: "100% safe via Razorpay", bg: "bg-purple-50" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Exams?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of students who trust Rohit Academy for premium study materials.</p>
        <Link to="/batches"
          className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
          Get Started Now <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}

function BatchCard({ batch, formatPrice }) {
  const disc = batch.originalPrice && batch.originalPrice > batch.price
    ? Math.round(((batch.originalPrice - batch.price) / batch.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/batches/${batch._id}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group">
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {batch.thumbnail ? (
          <img src={batch.thumbnail} alt={batch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-blue-400" size={48} />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {disc}% OFF
          </span>
        )}
        {batch.isFeatured && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs px-2.5 py-1 rounded-full font-bold">
            ⭐ Featured
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Class {batch.classId?.classNumber || batch.classId?.name}
          </span>
          {batch.streamId && (
            <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
              {batch.streamId.name}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">{batch.name}</h3>
        {batch.subjects?.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">{batch.subjects.slice(0, 3).map(s => s.name).join(" · ")}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-blue-600">{formatPrice(batch.price)}</span>
            {batch.originalPrice > batch.price && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(batch.originalPrice)}</span>
            )}
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{batch.subjects?.length || 0} subjects</span>
        </div>
      </div>
    </Link>
  );
}

export default Home;
