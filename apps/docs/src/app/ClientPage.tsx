'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Cursor, IndicatorPlugin } from '@cursor.js/core';
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
    const cursor = new Cursor({ humanize: true, speed: 0.5 }).use(new IndicatorPlugin());
    actorRef.current = cursor;

    // Set initial position immediately over the title
    setTimeout(() => {
      cursor.setSize(5).move('#cursor-zero');
    }, 100);

    return () => {
      cursor.destroy();
    };
  }, []);

  const runDemo = async () => {
    if (!actorRef.current || demoState === 'running') return;

    setDemoState('running');
    setSubmitted(false);
    setEmail('');
    setPassword('');

    try {
      await actorRef.current.wait(500);

      // Slide 1: Fill out the form
      await actorRef.current
        .setSize(1)
        .hover('#demo-email')
        .wait(300)
        .type('#demo-email', 'hello@cursor.js', { delay: 60 } as any)
        .wait(500)
        .hover('#demo-password')
        .wait(300)
        .type('#demo-password', 'secret', { delay: 60 } as any)
        .wait(600)
        .hover('#demo-submit')
        .wait(300)
        .click('#demo-submit')
        .wait(1000);

      setSubmitted(true);

      // Navigate to Slide 2 using Carousel Next button
      await actorRef.current.hover('.carousel-next').wait(400).click('.carousel-next').wait(1000);

      // Slide 2: Click Accordion
      await actorRef.current
        .hover('#demo-accordion-1')
        .wait(400)
        .click('#demo-accordion-1')
        .wait(1200)
        .hover('#demo-accordion-2')
        .wait(400)
        .click('#demo-accordion-2')
        .wait(1000)
        .hover('#cursor-zero')
        .setSize(5);

      setDemoState('done');
      setTimeout(() => setDemoState('idle'), 3000);
    } catch (err) {
      console.error('Demo interrupted', err);
      setDemoState('idle');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center space-y-6 pt-24 pb-8 md:pt-7 text-center px-6">
          <div className="flex flex-col items-center space-y-8">
            <div id="cursor-zero" className="size-36"></div>
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
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
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
