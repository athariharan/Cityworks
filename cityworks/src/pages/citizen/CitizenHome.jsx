// pages/citizen/CitizenHome.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import "../../styles/CitizenHome.css";


const QUICK_ACTIONS = [
  {
    // icon: <i className="cib-addthis"></i>,
    icon:<i className="bi bi-plus-square-fill plus-icon"></i>,
    title: "New Request",
    desc: "Submit a city issue — roads, lights, water, parks or any public service problem.",
    label: "Get Started →",
    path: "/citizen/request/new",
    variant: "qac--green",
  },
  {
    // icon: <i class="cib-addthis"></i>,
    
    icon: <i className="bi bi-pin-map-fill"></i>,
    title: "Track Status",
    desc: "Check real-time progress on your open requests and see estimated resolution dates.",
    label: "View Status →",
    path: "/citizen/track",
    variant: "qac--violet",
  },
  {
    icon: <i className="bi bi-clock-history"></i>,
    title: "My History",
    desc: "Browse all past requests, review resolved issues and download service reports.",
    label: "Browse History →",
    path: "/citizen/history",
    variant: "qac--slate",
  },
];

const EXPERTISE = [
  {
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=720&q=80",
    tag: "Roads & Paving",
    title: "Road Infrastructure",
    desc: "We deliver efficient and transparent road maintenance services powered by real-time citizen reporting and smart work order management. From pothole repairs to complete resurfacing, our system ensures timely issue resolution, optimized crew dispatch, and continuous monitoring—helping municipalities maintain safe, durable, and high-quality road networks with full accountability.",
  },
  {
    img: "https://images.unsplash.com/photo-1480714378702-aaab05297310?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=720&q=80",
    tag: "Urban Design",
    title: "Street Design & Streetscapes",
    desc: "CityWorks enables intelligent planning and management of urban streetscapes by integrating design standards with real-time field data. Our platform supports accessible, pedestrian-friendly layouts while ensuring streamlined maintenance workflows—helping cities deliver safe, functional, and aesthetically modern street environments.",
  },
  {
    img: "https://images.unsplash.com/photo-1519331379825-2ddaaff0eb27?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=720&q=80",
    tag: "Parks & Recreation",
    title: "Parks & Green Spaces",
    desc: "Our system supports the planning, development, and ongoing maintenance of parks and green spaces through centralized asset tracking and maintenance scheduling. CityWorks ensures cleaner, safer, and well-maintained recreational areas, enhancing community well-being and sustainable urban living.",
  },
  {
    img: "https://images.unsplash.com/photo-1559827291-72babf21d4dc?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=720&q=80",
    tag: "Utilities",
    title: "Water & Utilities",
    desc: "CityWorks provides end-to-end visibility into utility operations, from citizen-reported issues to resolution tracking. By enabling efficient pipeline maintenance, fault detection, and crew coordination, the platform ensures reliable water supply and uninterrupted essential services across the city.",
  },
  {
    img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80",
    tag: "Sanitation",
    title: "Waste Management & Sanitation",
    desc: "Through CityWorks, municipalities can streamline sanitation operations with real-time request tracking and service monitoring. The platform ensures timely waste collection, improved response to missed services, and data-driven planning for a cleaner, healthier urban environment.",
  },
  {
    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=720&q=80",
    fallback: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=720&q=80",
    tag: "Electrical",
    title: "Street Lighting & Electrical",
    desc: "CityWorks optimizes street lighting management by enabling fast issue reporting, efficient crew dispatch, and transparent maintenance tracking. From installation to repair, our platform ensures well-lit public spaces, improved safety, and consistent service delivery across all neighborhoods.",
  },
];


export default function CitizenHome() {
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);

  const realName = authUser?.name || localStorage.getItem("name") || null;
  const rawName  = realName || authUser?.email?.split("@")[0] || "User";
  const name     = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = name.charAt(0).toUpperCase();
  const user     = { name, initials };

  const handleImgError = (e, fallback) => {
    if (e.target.src !== fallback) e.target.src = fallback;
  };

  return (
    <CitizenLayout user={user}>

      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        <svg
          className="hero-skyline"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0"    y="80"  width="80"  height="80"  rx="2" fill="white" opacity="0.07"/>
          <rect x="20"   y="58"  width="40"  height="80"  rx="2" fill="white" opacity="0.07"/>
          <rect x="90"   y="48"  width="55"  height="112" rx="2" fill="white" opacity="0.07"/>
          <rect x="93"   y="35"  width="4"   height="15"  rx="1" fill="white" opacity="0.07"/>
          <rect x="155"  y="68"  width="70"  height="92"  rx="2" fill="white" opacity="0.07"/>
          <rect x="235"  y="38"  width="45"  height="122" rx="2" fill="white" opacity="0.07"/>
          <rect x="238"  y="26"  width="4"   height="14"  rx="1" fill="white" opacity="0.07"/>
          <rect x="290"  y="62"  width="85"  height="98"  rx="2" fill="white" opacity="0.07"/>
          <rect x="385"  y="42"  width="60"  height="118" rx="2" fill="white" opacity="0.07"/>
          <rect x="455"  y="72"  width="75"  height="88"  rx="2" fill="white" opacity="0.07"/>
          <rect x="540"  y="32"  width="50"  height="128" rx="2" fill="white" opacity="0.07"/>
          <rect x="543"  y="20"  width="4"   height="14"  rx="1" fill="white" opacity="0.07"/>
          <rect x="600"  y="58"  width="80"  height="102" rx="2" fill="white" opacity="0.07"/>
          <rect x="690"  y="48"  width="55"  height="112" rx="2" fill="white" opacity="0.07"/>
          <rect x="755"  y="68"  width="85"  height="92"  rx="2" fill="white" opacity="0.07"/>
          <rect x="850"  y="38"  width="60"  height="122" rx="2" fill="white" opacity="0.07"/>
          <rect x="853"  y="26"  width="4"   height="14"  rx="1" fill="white" opacity="0.07"/>
          <rect x="920"  y="62"  width="70"  height="98"  rx="2" fill="white" opacity="0.07"/>
          <rect x="1000" y="48"  width="55"  height="112" rx="2" fill="white" opacity="0.07"/>
          <rect x="1065" y="72"  width="80"  height="88"  rx="2" fill="white" opacity="0.07"/>
          <rect x="1155" y="42"  width="65"  height="118" rx="2" fill="white" opacity="0.07"/>
          <rect x="1230" y="58"  width="75"  height="102" rx="2" fill="white" opacity="0.07"/>
          <rect x="1315" y="38"  width="55"  height="122" rx="2" fill="white" opacity="0.07"/>
          <rect x="1318" y="26"  width="4"   height="14"  rx="1" fill="white" opacity="0.07"/>
          <rect x="1380" y="68"  width="60"  height="92"  rx="2" fill="white" opacity="0.07"/>
          <rect x="0"    y="118" width="50"  height="42"  rx="2" fill="white" opacity="0.14"/>
          <rect x="58"   y="108" width="45"  height="52"  rx="2" fill="white" opacity="0.14"/>
          <rect x="112"  y="120" width="55"  height="40"  rx="2" fill="white" opacity="0.14"/>
          <rect x="176"  y="110" width="40"  height="50"  rx="2" fill="white" opacity="0.14"/>
          <rect x="225"  y="112" width="62"  height="48"  rx="2" fill="white" opacity="0.14"/>
          <rect x="298"  y="122" width="50"  height="38"  rx="2" fill="white" opacity="0.14"/>
          <rect x="357"  y="109" width="46"  height="51"  rx="2" fill="white" opacity="0.14"/>
          <rect x="412"  y="114" width="65"  height="46"  rx="2" fill="white" opacity="0.14"/>
          <rect x="487"  y="107" width="46"  height="53"  rx="2" fill="white" opacity="0.14"/>
          <rect x="542"  y="117" width="55"  height="43"  rx="2" fill="white" opacity="0.14"/>
          <rect x="607"  y="110" width="45"  height="50"  rx="2" fill="white" opacity="0.14"/>
          <rect x="661"  y="114" width="62"  height="46"  rx="2" fill="white" opacity="0.14"/>
          <rect x="732"  y="107" width="50"  height="53"  rx="2" fill="white" opacity="0.14"/>
          <rect x="792"  y="120" width="46"  height="40"  rx="2" fill="white" opacity="0.14"/>
          <rect x="847"  y="112" width="62"  height="48"  rx="2" fill="white" opacity="0.14"/>
          <rect x="918"  y="117" width="50"  height="43"  rx="2" fill="white" opacity="0.14"/>
          <rect x="977"  y="107" width="46"  height="53"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1032" y="120" width="55"  height="40"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1097" y="110" width="45"  height="50"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1151" y="112" width="62"  height="48"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1222" y="117" width="50"  height="43"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1282" y="107" width="46"  height="53"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1337" y="120" width="55"  height="40"  rx="2" fill="white" opacity="0.14"/>
          <rect x="1400" y="110" width="40"  height="50"  rx="2" fill="white" opacity="0.14"/>
        </svg>

        {/* Wave into cream background below */}
        <svg
          className="hero-wave"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="#f9f7f4"/>
        </svg>

        <div className="hero-content">
          <div className="hero-badge">🌿 Welcome back, {user.name}!</div>
          <h1 className="hero-title">
            Your City,{" "}
            <span className="hero-title-violet">Your Voice.</span>
          </h1>
          <p className="hero-desc">
            Report issues, track repairs, and stay connected with the
            services that keep your city running. CityWorks puts
            municipal services at your fingertips.
          </p>
          
        </div>
      </div>

      {/* ── Page body — warm cream background ── */}
      <div className="page-body">

        {/* ── Quick Action Cards ── */}
        <section className="qactions">
          <div className="qactions-inner">
            <p className="qactions-label">Quick Actions</p>
            <div className="qactions-grid">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.title}
                  className={`qac ${qa.variant}`}
                  onClick={() => navigate(qa.path)}
                >
                  <div className="qac-icon">{qa.icon}</div>
                  <div className="qac-title">{qa.title}</div>
                  <p className="qac-desc">{qa.desc}</p>
                  <span className="qac-link">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Expertise ── */}
        <section className="expertise-section">
          <div className="expertise-inner">
            <div className="expertise-header">
              <span className="expertise-eyebrow">What We Do</span>
              <h2 className="expertise-title">Our City Services</h2>
              <p className="expertise-sub">
                From roads to street lights, we manage the infrastructure that makes
                urban life safe, clean, and comfortable.
              </p>
            </div>

            {EXPERTISE.map((item, i) => (
              <div key={item.title} className={`exp-row ${i % 2 === 1 ? "exp-row--flip" : ""}`}>
                <div className="exp-img-wrap">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="exp-img"
                    loading="lazy"
                    onError={(e) => handleImgError(e, item.fallback)}
                  />
                </div>
                <div className="exp-card">
                  <span className="exp-tag">{item.tag}</span>
                  <h3 className="exp-card-title">{item.title}</h3>
                  <p className="exp-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>{/* end .page-body */}

    </CitizenLayout>
  );
}
