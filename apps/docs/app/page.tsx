'use client';

import { useEffect, useRef, useState } from 'react';
import { Cursor } from '@cursor.js/core';

export default function Page() {
  const [btn1Text, setBtn1Text] = useState('Hover and Click Me');
  const [btn1Color, setBtn1Color] = useState('');
  const [btn2Text, setBtn2Text] = useState('Bottom Button');
  const [btn2Color, setBtn2Color] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'done'>('idle');
  const actorRef = useRef<Cursor | null>(null);

  useEffect(() => {
    actorRef.current = new Cursor({ humanize: true, speed: 0.5, showIndicator: true });
    return () => {
      // Cleanup if necessary
    };
  }, []);

  const handleBtn1Click = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Btn1 clicked!', e);
    setBtn1Text(`Clicked!`);
    setBtn1Color('#42b983');
  };

  const handleBtn2Click = () => {
    setBtn2Text(`Deep Button Clicked!`);
    setBtn2Color('#42b983');
  };

  const runDemo = async () => {
    if (!actorRef.current) return;

    setDemoState('running');
    setBtn1Text('Demo started. Cursor incoming...');
    setBtn1Color('#666');
    setBtn2Text('Not clicked yet.');
    setBtn2Color('#666');
    setInputValue('');

    await actorRef.current.wait(1000);

    await actorRef.current
      .hover('#btn1')
      .wait(600)
      .click('#btn1')
      .wait(1000)
      .type('#input1', 'Hello World! Cursor.js in action...', {
        delay: 50,
      } as any)
      .wait(1500)
      .hover('#btn2')
      .wait(800)
      .click('#btn2');

    console.log('Demo Task Successfully Completed!');
    setBtn2Text('Demo Completed!');
    setDemoState('done');
    setTimeout(() => setDemoState('idle'), 2000);
  };

  return (
    <main style={{ padding: '40px', minHeight: '200vh' }}>
      <h1>Actor.js Docs</h1>

      <button
        id="start-demo-btn"
        onClick={runDemo}
        disabled={demoState === 'running'}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          background: demoState === 'running' ? '#ccc' : '#ff4757',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 10px rgba(255, 71, 87, 0.4)',
        }}
      >
        {demoState === 'running' ? '⏳ Demo Running...' : '▶ Start Demo'}
      </button>

      <div
        style={{
          marginTop: '50px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '300px',
        }}
      >
        <button id="btn1" onClick={handleBtn1Click} style={{ padding: '10px' }}>
          Button 1
        </button>
        <p id="btn1-text" style={{ color: btn1Color }}>
          {btn1Text}
        </p>

        <input
          id="input1"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type here..."
          style={{ padding: '10px' }}
        />
      </div>

      <div style={{ marginTop: '150vh', paddingBottom: '100px' }}>
        <button id="btn2" onClick={handleBtn2Click} style={{ padding: '10px' }}>
          Button 2
        </button>
        <p id="btn2-text" style={{ color: btn2Color }}>
          {btn2Text}
        </p>
      </div>
    </main>
  );
}
