/*
 * Mystic Diary
 * © 2026 Saurav Raj
 * All rights reserved.
 */
// Mystic Diary — Created by Saurav Raj
import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import diaryTexture from "./assets/diary-textures.png";
import diaryCover from "./assets/diary-cover-layer.png";
import openDiaryButton from "./assets/open-diary-button.png";
import insideBackground from "./assets/inside/inside-background.png";
import openDiaryParchment from "./assets/inside/open-diary-parchment.png";
import focusedQuestionPage from "./assets/inside/focused-question-page.png";
import MagicalAtmosphere from "./components/MagicalAtmosphere.jsx";

import "./App.css";

const ABSORB_MS = 1200;
const API_URL = import.meta.env.VITE_API_URL || "";

const busyPhases = new Set(["absorbing", "consulting"]);

function App() {
      const prefersReducedMotion = useReducedMotion();
      const [isOpen, setIsOpen] = useState(false);
      const [question, setQuestion] = useState("");
      const [answer, setAnswer] = useState("");
      const [error, setError] = useState("");
      const [phase, setPhase] = useState("idle");
      const [isFocused, setIsFocused] = useState(false);

      const isBusy = busyPhases.has(phase);

      const openDiary = () => {
        setError("");
        setAnswer("");
        setQuestion("");
        setPhase("idle");
        setIsOpen(true);
      };

      const closeDiary = () => {
        setIsOpen(false);
        setIsFocused(false);
        setQuestion("");
        setAnswer("");
        setError("");
        setPhase("idle");
      };

      const askDiary = async () => {
        if (isBusy) {
          return;
        }

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
          setAnswer("");
          setError("The page is blank. Write something first.");
          setPhase("error");
          return;
        }

        setError("");
        setAnswer("");
        setPhase("absorbing");

        if (!prefersReducedMotion) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, ABSORB_MS);
          });
        }

        setQuestion("");
        setPhase("consulting");

        try {
          const response = await fetch(`${API_URL}/api/diary`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: trimmedQuestion,
            }),
          });

          let data = {};

          try {
            data = await response.json();
          } catch {
            data = {};
          }

          if (!response.ok) {
            throw new Error(
              data.error || data.message || "The diary could not answer."
            );
          }

          const nextAnswer = (data.answer || data.response || "").trim();

          if (!nextAnswer) {
            throw new Error("The diary remains silent...");
          }

          setAnswer(nextAnswer);
          setPhase("revealing");
        } catch (err) {
          const message =
            err instanceof TypeError
              ? "The connection to the diary was lost."
              : err.message || "Unable to communicate with the diary.";

          setError(message);
          setPhase("error");
        }
      };

      const handleKeyDown = (event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          askDiary();
        }
      };

      const floatTransition = prefersReducedMotion
        ? { duration: 0.2 }
        : { duration: 7.2, repeat: Infinity, ease: "easeInOut" };

      return (
        <main className="scene">
          <MagicalAtmosphere />
          <footer className="app-credit">© 2026 Saurav Raj. All rights reserved.</footer>

          <AnimatePresence mode="wait">
            {!isOpen && (
              <motion.div
                key="closed-diary"
                className="closed-screen"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 1.035, filter: "blur(3px)" }
                }
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="closed-diary-float"
                  animate={prefersReducedMotion ?
                    { y: 0, rotate: 0 } :
                    {
                      y: [0, -11, -4, 0],
                      rotate: [-0.65, 0.65, -0.25, -0.65],
                      scale: [0.995, 1.008, 1, 0.995],
                      filter: [
                        "drop-shadow(0 28px 35px rgba(0, 0, 0, 0.5))",
                        "drop-shadow(0 32px 40px rgba(0, 0, 0, 0.6))",
                        "drop-shadow(0 28px 35px rgba(0, 0, 0, 0.5))"
                      ]
                    }
                  }
                  transition={floatTransition}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.025, filter: "drop-shadow(0 0 24px rgba(93, 216, 255, 0.24)) drop-shadow(0 28px 36px rgba(0, 0, 0, 0.65))" }}
                >
                  <img
                    src={diaryCover}
                    alt="Closed Mystic Diary"
                    className="closed-diary-image"
                  />
                  <button
                    type="button"
                    className="open-trigger"
                    onClick={openDiary}
                    aria-label="Open diary"
                  >
                    <img src={openDiaryButton} className="open-button-art" alt="" />
                  </button>
                </motion.div>
              </motion.div>
            )}

            {isOpen && (
              <motion.div
                key="open-diary"
                className={`open-screen${isFocused ? " right-page-focused" : ""}`}
                style={{ backgroundImage: `url(${insideBackground})` }}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.9,
                        filter: "blur(8px)",
                        rotate: -0.5,
                        x: -20
                      }
                }
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0, x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.9,
                        filter: "blur(8px)",
                        rotate: -0.5,
                        x: -20
                      }
                }
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="diary-float inside-diary"
                  animate={prefersReducedMotion
                    ? { y: 0, rotate: 0 }
                    : isOpen
                    ? {
                        y: [-1, 1, -1],
                        rotate: [-0.05, 0.05, -0.05],
                        scale: [0.995, 1.005, 0.995],
                        filter: [
                          "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
                          "drop-shadow(0 12px 20px rgba(0,0,0,0.4))",
                          "drop-shadow(0 10px 15px rgba(0,0,0,0.3))"
                        ]
                      }
                    : {
                        y: [-3, 3, -3],
                        rotate: [-0.15, 0.15, -0.15],
                        scale: [0.99, 1.01, 0.99],
                        filter: [
                          "drop-shadow(0 28px 35px rgba(0,0,0,0.5))",
                          "drop-shadow(0 32px 40px rgba(0,0,0,0.6))",
                          "drop-shadow(0 28px 35px rgba(0,0,0,0.5))"
                        ]
                      }
                  }
                  transition={floatTransition}
                >
                  <img
                    src={openDiaryParchment}
                    alt="Open Mystic Diary"
                    className="background-image"
                  />

                  <div className="left-page-tint" aria-hidden="true" />

                  <section className="left-page-content" aria-label="The Mystic Diary">
                    <div className="page-rule"><span>✦</span></div>
                    <h1>The Mystic Diary</h1>
                    <p className="left-page-intro">I see more than you believe.<br />I know more than you realize.<br />Ask, and I shall respond.</p>
                    <span className="left-page-rune" aria-hidden="true">☽</span>
                    <p className="left-page-closing">The truth lies within<br />your words.</p>
                  </section>

                  <div
                    className="right-page-texture"
                    style={{ backgroundImage: `url(${diaryTexture})` }}
                  />

                  <div className="right-page-content">
                    <p className="page-heading">Ask what you seek</p>

                    <motion.textarea
                      className="question-input"
                      value={question}
                      onChange={(event) => {
                        setQuestion(event.target.value);
                        if (phase === "error" || phase === "revealing") {
                          setError("");
                          setAnswer("");
                          setPhase("idle");
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      disabled={isBusy}
                      placeholder="Write your question here…"
                      spellCheck={false}
                      aria-label="Write your question in the diary"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: phase === "absorbing" ? 0 : 1,
                        filter:
                          phase === "absorbing" && !prefersReducedMotion
                            ? "blur(5px)"
                            : "blur(0px)",
                      }}
                      transition={{ duration: prefersReducedMotion ? 0.2 : 0.7 }}
                    />

                    <AnimatePresence>
                      {phase === "absorbing" && !prefersReducedMotion && (
                        <motion.div
                          key="absorb"
                          className="absorb-layer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="absorption-effect">
                            {/* Enhanced ink motes with varied sizes and opacities */}
                            <div className="enhanced-ink-motes">
                              {Array.from({ length: 15 }, (_, index) => (
                                <span
                                  key={index}
                                  className={`enhanced-ink-mote enhanced-ink-mote-${index + 1}`}
                                />
                              ))}
                            </div>
                            {/* Page reaction effect */}
                            <div className="page-reaction" />
                            {/* Magical dust particles */}
                            <div className="magical-dust">
                              {Array.from({ length: 8 }, (_, index) => (
                                <span key={index} className="magical-dust-particle" />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      className="image-ask-button"
                      onClick={() => setIsFocused(true)}
                      disabled={isBusy}
                      aria-label="Ask the diary"
                    >
                      ✦ Ask the diary ✦
                    </button>

                    <div className="answer-overlay" aria-live="polite">
                      <AnimatePresence mode="wait">
                        {phase === "consulting" && (
                          <motion.div
                            key="loading"
                            className="answer-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                          >
                            <span className="loading-symbol">✦</span>
                            <span className="loading-dots">✦ · ✦ · ✦</span>
                          </motion.div>
                        )}

                        {phase === "error" && error && (
                          <motion.div
                            key="error"
                            className="answer-error"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                          >
                            {error}
                          </motion.div>
                        )}

                        {phase === "revealing" && answer && (
                          <motion.div
                            key="answer"
                            className="answer-text"
                            initial={
                              prefersReducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 4, scale: 0.95, filter: "blur(2px)" }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {isFocused && createPortal(
                    <AnimatePresence>
                      <motion.div className="focused-page-scene" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="focused-page-wrapper">
                          <img src={focusedQuestionPage} className="focused-page-image" alt="Focused diary page" />
                          <button type="button" className="focused-return" onClick={() => setIsFocused(false)}>← Return to diary</button>
                          <textarea className="focused-question-input" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} disabled={isBusy} placeholder="Write your question here…" aria-label="Write your question" />
                          <button type="button" className="focused-ask-hitbox" onClick={askDiary} disabled={isBusy} aria-label="Ask the diary" />
                          <div className="focused-answer" aria-live="polite">
                            {phase === "consulting" && <span className="focused-loading">✦ · ✦ · ✦</span>}
                            {phase === "error" && error && <span className="answer-error">{error}</span>}
                            {phase === "revealing" && answer && <motion.div initial={{ opacity: 0, y: 8, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .7 }}>{answer}</motion.div>}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>,
                    document.body
                  )}

                  <motion.button
                    type="button"
                    className="close-diary"
                    onClick={closeDiary}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Close diary
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      );
      }
export default App;
