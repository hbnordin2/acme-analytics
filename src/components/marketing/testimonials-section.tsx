import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Acme Analytics replaced three tools for us. The funnel analysis alone saved us 10 hours a week.",
    name: "Sarah Chen",
    role: "VP Engineering",
    company: "TechCorp",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sarah",
    rating: 5,
  },
  {
    quote:
      "We switched from Mixpanel and haven't looked back. The real-time events are a game changer.",
    name: "Marcus Johnson",
    role: "Product Lead",
    company: "ScaleUp",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=Marcus",
    rating: 5,
  },
  {
    quote:
      "Finally, an analytics tool that doesn't require a data engineering degree to use.",
    name: "Priya Sharma",
    role: "Founder",
    company: "LaunchPad",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=Priya",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by product teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what teams around the world are saying about Acme Analytics.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="flex flex-col border-border/50 transition-all duration-300 hover:border-border hover:shadow-lg"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                {/* Star rating */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full bg-muted"
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
