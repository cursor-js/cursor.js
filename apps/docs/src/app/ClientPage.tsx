'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Cursor, IndicatorPlugin, RipplePlugin } from '@cursor.js/core';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function ClientPage() {
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'done'>('idle');
  const actorRef = useRef<Cursor | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const c = new Cursor({ humanize: true, speed: 0.5 }).use(new IndicatorPlugin()).use(
      new RipplePlugin({
        color: 'rgba(59, 130, 246, 0.5)',
        duration: 200,
        size: 70,
      }),
    );
    actorRef.current = c;

    // Wrap the repeatable scenario in a function and link recursively
    const buildDemoSequence = () => {
      c.stop()
        .do(() => setDemoState('running'))
        .wait(500)
        .until(
          () => {
            const prevBtn = document.querySelector('.carousel-prev');
            return prevBtn?.hasAttribute('disabled') || false;
          },
          (ctx) => ctx.click('.carousel-prev').wait(500),
        )
        .setSize(1)
        .if(
          () =>
            document.querySelector<HTMLInputElement>('#demo-email')?.value !== 'hello@cursor.js',
          (ctx) =>
            ctx
              .hover('#demo-email')
              .wait(300)
              .do(() => setEmail(''))
              .type('#demo-email', 'hello@cursor.js', { delay: 60 } as any)
              .wait(500),
        )
        .if(
          () => document.querySelector<HTMLInputElement>('#demo-password')?.value !== 'secret',
          (ctx) =>
            ctx
              .hover('#demo-password')
              .wait(300)
              .do(() => setPassword(''))
              .type('#demo-password', 'secret', { delay: 60 } as any)
              .wait(600),
        )
        .hover('#demo-submit')
        .wait(300)
        .click('#demo-submit')
        .wait(1000)
        .do(() => setSubmitted(true))
        .hover('.carousel-next')
        .wait(400)
        .click('.carousel-next')
        .wait(1000)
        .hover('#demo-accordion-1')
        .wait(400)
        .click('#demo-accordion-1')
        .wait(1200)
        .hover('#demo-accordion-2')
        .wait(400)
        .click('#demo-accordion-2')
        .wait(1000)
        .hover('#cursor-beginning')
        .setSize(5)
        .do(() => {
          setDemoState('done');
          setTimeout(() => setDemoState('idle'), 3000);
        })
        .do(buildDemoSequence); // Re-queue the scenario at the end
    };

    c.wait(100).setSize(5).move('#cursor-beginning').do(buildDemoSequence);

    return () => {
      c.destroy();
    };
  }, []);

  const runDemo = () => {
    if (!actorRef.current || demoState === 'running') return;
    setSubmitted(false);
    setEmail('');
    setPassword('');
    actorRef.current.next();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 pt-24 pb-8 md:pt-7 text-center px-6">
          <div className="flex flex-col items-center space-y-8">
            {/* The cursor graphic at scale 5 is ~65x90. We offset the actual target to make the graphic visually centered in the 144x144 area. */}
            <div className="relative w-20 h-26">
              <div id="cursor-beginning" className="absolute left-0 top-0 size-px" />
            </div>
            <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
              cursor.js
            </h1>
          </div>
          <div className="flex space-x-4">
            <Button size="lg" onClick={runDemo} disabled={demoState === 'running'}>
              {demoState === 'running' ? 'Demo is running...' : 'Run Live Demo'}
            </Button>
            <Link
              href="https://github.com/cihad/cursor.js"
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              GitHub
            </Link>
          </div>
        </section>

        <section className="container mx-auto flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-3xl rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-8">
              <Carousel className="w-full">
                <CarouselContent>
                  <CarouselItem>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Step 1: Fill Forms</h2>
                      <p className="text-muted-foreground mb-6">
                        Cursor.js precisely moves, focuses, and mimics human typing delays.
                      </p>

                      <div className="space-y-4 max-w-sm border p-6 rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="demo-email">Email</Label>
                          <Input
                            id="demo-email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-password">Password</Label>
                          <Input
                            id="demo-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <Button
                          id="demo-submit"
                          className="w-full"
                          onClick={() => setSubmitted(true)}
                        >
                          {submitted ? 'Signed In!' : 'Sign In'}
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-4">Step 2: Interact with Details</h2>
                      <p className="text-muted-foreground mb-6">
                        Effortlessly click on targets, wait for animations, and trigger complex
                        Shadcn elements.
                      </p>

                      <Accordion
                        type="single"
                        collapsible
                        className="w-full max-w-lg border px-4 rounded-lg bg-background"
                      >
                        <AccordionItem value="item-1">
                          <AccordionTrigger id="demo-accordion-1">
                            Is it accessible?
                          </AccordionTrigger>
                          <AccordionContent>
                            Yes. Cursor.js strictly interacts with normal DOM nodes.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger id="demo-accordion-2">
                            Can it be styled?
                          </AccordionTrigger>
                          <AccordionContent>
                            Yes. It comes with default styles that you can override with CSS.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger id="demo-accordion-3">Is it animated?</AccordionTrigger>
                          <AccordionContent>
                            Yes. Using simulated spring algorithms for maximum realism.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="carousel-prev" />
                <CarouselNext className="carousel-next" />
              </Carousel>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
