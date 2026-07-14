import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Are the spots on HiddenSpots.in free to visit?",
    answer: "Most of our community-sourced hidden spots are natural locations (like viewpoints, waterfalls, and offbeat trails) that are completely free to visit. If a specific spot has an entry fee or is on private property, our users typically mention it in the spot's description."
  },
  {
    question: "How do you verify the exact location of a hidden spot?",
    answer: "When a user submits a spot, they drop a pin directly on an interactive map. Our moderators then manually review the coordinates against satellite imagery and the submitted photos to ensure the GPS location is 100% accurate before approving the spot."
  },
  {
    question: "Can I share my own secret travel destinations?",
    answer: "Absolutely! We encourage travelers to share their favorite secluded spots. Simply create a free account with your mobile number, click 'Add Spot', drop the location pin, and upload a few photos or an Instagram reel link."
  },
  {
    question: "What is the Verification Score?",
    answer: "The Verification Score is a trust metric assigned to each spot. It increases when the community validates the location, leaves positive reviews, or confirms the GPS coordinates are accurate. A high score means the spot is highly trusted and beautiful."
  },
  {
    question: "Is it safe to visit these offbeat locations?",
    answer: "While we verify the coordinates, these are offbeat natural locations. We recommend traveling during daylight hours, traveling in groups for extremely secluded areas, and always prioritizing your safety. Please respect local guidelines and practice 'Leave No Trace' principles."
  }
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="font-script text-2xl text-sunset">got questions?</div>
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">Everything you need to know about finding and sharing hidden travel gems.</p>
      </div>

      <Accordion className="w-full bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 px-6 py-2 shadow-lg">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
            <AccordionTrigger className="text-left font-heading text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 hover:text-brand transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
