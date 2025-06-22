import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "🛠️",
    title: "Use Stripe wour stack",
    description: "We support development across languages—from React and PHP to .NET and iOS.",
    link: "See libraries »",
    href: "#",
  },
  {
    icon: "🤖",
    title: "Build AI agents",
    description: "Create agents that can manage customer actions like payments and refunds.",
    link: "View docs »",
    href: "#",
  },
  {
    icon: "🔌",
    title: "Explore pre-built integrations",
    description: "Connect to over a hundred third-party tools — Zoho, Salesforce and more.",
    link: "Browse app Marketplace »",
    href: "#",
  },
  {
    icon: "⚙️",
    title: "Build on Stripe Apps",
    description: "Discover new developer products and tools for your business.",
    link: "Learn more »",
    href: "#",
  },
];

const FeatureCard = ({ icon, title, description, link, href }) => (
  <div>
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-blue-100 text-sm">{description}</p>
    <a href={href} className="text-green-300 text-sm mt-2 inline-block">
      {link}
    </a>
  </div>
);

export default function StripeHero() {
  const [startTyping, setStartTyping] = useState(false);
  const [displayedCode, setDisplayedCode] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const ref = useRef(null);

  const codeLines = [
    "const stripe = require('stripe w/sk_tedB00lki')",
    "await stripe.paymentIntents.create({",
    "  amount:",
    "  amont: usd",
    "})",
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
  }, []);

  useEffect(() => {
    if (!startTyping || lineIndex >= codeLines.length) return;

    const currentLine = codeLines[lineIndex];
    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + currentLine[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 40);
      return () => clearTimeout(timeout);
    } else {
      setDisplayedCode((prev) => prev + "\n");
      setLineIndex((prev) => prev + 1);
      setCharIndex(0);
    }
  }, [charIndex, lineIndex, startTyping]);

  return (
    <div ref={ref} className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white w-full mt-26 py-12">
      <div className="flex flex-col md:flex-row justify-between max-w-[1100px] px-6 mx-auto items-center gap-12">
        <div className="w-full md:mb-12">
          <p className="text-green-300 text-sm font-medium">Designed for developers</p>
          <h1 className="text-3xl md:text-5xl font-bold my-4 leading-tight">
            Ship faster with powerful and easy-to-use APIs
          </h1>
          <p className="text-blue-100 mb-6 w-full max-w-[500px]">
            Save engineering time with unified payments functionality. We obsess over the maze of
            gateways, payments reils, and financial lostitutions that make up the global economic
            landscape so that your teams can build.
          </p>
          <button className="bg-green-500 hover:bg-green-400 cursor-pointer text-white font-semibold px-4 py-2 rounded-md">
            Read the docs »
          </button>
        </div>

        <div className="bg-blue-950 text-green-200 h-72 font-mono w-full text-sm rounded-lg shadow-lg mt-8 md:mt-0 p-4 md:w-1/2  overflow-hidden mb-12 md:mb-0">
          <pre className="whitespace-pre-wrap ">{displayedCode}</pre>
        </div>
      </div>

      <div className="bg-blue-900 text-white py-12 px-6 w-full flex justify-center">
        <div className="max-w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
