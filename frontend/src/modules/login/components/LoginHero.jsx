import { BookOpen, Database, Users, BarChart3 } from "lucide-react";

/**
 * Feature item data
 */
const features = [
  {
    icon: Database,
    title: "Digital Catalog",
    description: "Organize thousands of books",
  },
  {
    icon: Users,
    title: "Member Management",
    description: "Track borrowing history",
  },
];

/**
 * FeatureItem Component - Individual feature display
 */
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 !important w-12 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
        <Icon className="size-5 xl:size-6 text-white" />
      </div>
      <div>
        <p className="font-semibold text-base xl:text-lg text-white">{title}</p>
        <p className="text-white/85 text-sm">{description}</p>
      </div>
    </div>
  );
}

/**
 * LoginHero Component - Left side hero section with image and features
 */
export function LoginHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-800/85 to-slate-700/85 z-10" />

      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"
        alt="Library Books"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center px-8 xl:px-12 text-white">
        <div className="space-y-6 max-w-lg">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/10">
              <BookOpen className="size-7 xl:size-8 text-white" />
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white">
              Library Management
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg xl:text-xl text-white/95 leading-relaxed">
            Welcome back! Manage your library collection, track borrowers, and
            organize books with ease.
          </p>

          {/* Features List */}
          <div className="space-y-3 xl:space-y-4 pt-6 xl:pt-8">
            {features.map((feature) => (
              <FeatureItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginHero;
