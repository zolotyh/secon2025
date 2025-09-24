// Animation and physics variables
let engine,
  world,
  bodies = [];
let animationStarted = false;
let physicsLetters = [];
let animationFrameId;

// Initialize physics engine without canvas
function initPhysics() {
  engine = Matter.Engine.create();
  world = engine.world;

  // Disable gravity initially
  engine.world.gravity.y = 0;

  // Create invisible boundaries
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const ground = Matter.Bodies.rectangle(
    windowWidth / 2,
    windowHeight + 25,
    windowWidth,
    50,
    { isStatic: true },
  );

  const leftWall = Matter.Bodies.rectangle(
    -25,
    windowHeight / 2,
    50,
    windowHeight,
    { isStatic: true },
  );

  const rightWall = Matter.Bodies.rectangle(
    windowWidth + 25,
    windowHeight / 2,
    50,
    windowHeight,
    { isStatic: true },
  );

  Matter.World.add(world, [ground, leftWall, rightWall]);

  // Start physics runner
  Matter.Runner.run(engine);
}

// Create physics body for a letter
function createLetterPhysics(element, letter, styles) {
  const rect = element.getBoundingClientRect();

  // Create visual letter element
  const letterEl = document.createElement("div");
  letterEl.className = "physics-letter";
  letterEl.textContent = letter;
  letterEl.style.cssText = styles;
  letterEl.style.left = rect.left + "px";
  letterEl.style.top = rect.top + "px";
  document.body.appendChild(letterEl);

  // Create physics body
  const body = Matter.Bodies.rectangle(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    Math.max(rect.width, 8),
    Math.max(rect.height, 16),
    {
      restitution: 0.4,
      friction: 0.7,
      frictionAir: 0.02,
      density: 0.002,
      angle: (Math.random() - 0.5) * 0.2,
    },
  );

  Matter.World.add(world, body);

  return {
    body: body,
    element: letterEl,
    originalElement: element,
  };
}

// Break text into letters and create physics bodies
function breakIntoLetters() {
  const elements = document.querySelectorAll(".js-broken");

  elements.forEach((element) => {
    const spans = element.querySelectorAll('span[style*="font-weight"]');

    // Handle nested spans (like AI)
    if (spans.length > 0) {
      spans.forEach((span) => {
        processTextElement(span);
      });
      // Process remaining text
      const textNodes = getTextNodes(element);
      textNodes.forEach((node) => {
        if (node.textContent.trim()) {
          const tempSpan = document.createElement("span");
          tempSpan.textContent = node.textContent;
          tempSpan.style.cssText = getComputedStyleString(element);
          node.parentNode.insertBefore(tempSpan, node);
          processTextElement(tempSpan);
          node.remove();
        }
      });
    } else {
      processTextElement(element);
    }

    // Hide original element
    setTimeout(() => {
      element.style.visibility = "hidden";
    }, 100);
  });
}

// Process individual text element
function processTextElement(element) {
  const text = element.textContent;
  const styles = getComputedStyleString(element);

  // Clear original element content
  element.innerHTML = "";

  // Create individual letter elements for measurement
  const letterElements = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === " ") continue;

    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = char;
    span.style.cssText = styles;
    span.style.display = "inline-block";
    element.appendChild(span);
    letterElements.push(span);
  }

  // Small delay to ensure DOM is updated
  setTimeout(() => {
    letterElements.forEach((letterEl, index) => {
      setTimeout(() => {
        const physicsLetter = createLetterPhysics(
          letterEl,
          letterEl.textContent,
          styles,
        );
        physicsLetters.push(physicsLetter);
      }, index * 5);
    });
  }, 50);
}

// Get computed style as string
function getComputedStyleString(element) {
  const computedStyle = window.getComputedStyle(element);
  return `
        font-family: ${computedStyle.fontFamily};
        font-size: ${computedStyle.fontSize};
        font-weight: ${computedStyle.fontWeight};
        letter-spacing: ${computedStyle.letterSpacing};
        line-height: ${computedStyle.lineHeight};
        color: ${computedStyle.color};
        text-transform: ${computedStyle.textTransform};
    `;
}

// Get text nodes from element
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      if (
        node.parentNode.tagName === "SPAN" &&
        node.parentNode.style.fontWeight
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) {
      textNodes.push(node);
    }
  }
  return textNodes;
}

// Start the disintegration animation
function startDisintegration() {
  if (animationStarted) return;
  animationStarted = true;

  // Break text into letters
  breakIntoLetters();

  // Enable gravity and chaos after a short delay
  setTimeout(() => {
    engine.world.gravity.y = 1.2;

    // Add random forces to letters for more chaos
    physicsLetters.forEach((letter, index) => {
      setTimeout(() => {
        const randomForce = {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.3) * 0.005,
        };
        Matter.Body.applyForce(letter.body, letter.body.position, randomForce);

        // Add random angular velocity
        Matter.Body.setAngularVelocity(
          letter.body,
          (Math.random() - 0.5) * 0.3,
        );
      }, index * 15);
    });
  }, 300);
}

// Update letter positions based on physics
function updateLetterPositions() {
  physicsLetters.forEach((letter) => {
    const pos = letter.body.position;
    const angle = letter.body.angle;

    letter.element.style.transform = `translate(${pos.x - letter.element.offsetWidth / 2}px, ${pos.y - letter.element.offsetHeight / 2}px) rotate(${angle}rad)`;

    // Remove letters that fell too far down
    if (pos.y > window.innerHeight + 200) {
      if (letter.element.parentNode) {
        letter.element.parentNode.removeChild(letter.element);
      }
      Matter.World.remove(world, letter.body);
    }
  });

  // Filter out removed letters
  physicsLetters = physicsLetters.filter(
    (letter) =>
      letter.element.parentNode &&
      letter.body.position.y <= window.innerHeight + 200,
  );
}

// Animation loop
function animate() {
  updateLetterPositions();
  animationFrameId = requestAnimationFrame(animate);
}

// Clean up physics letters
function cleanupPhysicsLetters() {
  physicsLetters.forEach((letter) => {
    if (letter.element.parentNode) {
      letter.element.parentNode.removeChild(letter.element);
    }
    Matter.World.remove(world, letter.body);
  });
  physicsLetters = [];
}

// Reset slide to original state
function resetSlide() {
  // Stop animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Clean up physics letters
  cleanupPhysicsLetters();
  animationStarted = false;

  // Reset gravity
  if (engine) {
    engine.world.gravity.y = 0;
  }

  // Reset original text
  const elements = document.querySelectorAll(".js-broken");
  const texts = [
    "Тренды",
    "во фронтенд разработке",
    'в эпоху <span style="font-weight: 300">AI</span>',
  ];

  elements.forEach((element, index) => {
    element.style.visibility = "visible";
    if (texts[index]) {
      element.innerHTML = texts[index];
    }
  });
}

// Initialize everything when slide loads
Reveal.addEventListener("ready", () => {
  initPhysics();
  animate();

  // Start disintegration after 1.5 seconds (0.5s slide load + 1s delay)
  setTimeout(() => {
    startDisintegration();
  }, 1500);
});

// Handle window resize
window.addEventListener("resize", () => {
  // Update physics world boundaries
  if (world) {
    const bodies = Matter.Composite.allBodies(world);
    const boundaries = bodies.filter((body) => body.isStatic);

    // Remove old boundaries
    Matter.World.remove(world, boundaries);

    // Add new boundaries
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const ground = Matter.Bodies.rectangle(
      windowWidth / 2,
      windowHeight + 25,
      windowWidth,
      50,
      { isStatic: true },
    );

    const leftWall = Matter.Bodies.rectangle(
      -25,
      windowHeight / 2,
      50,
      windowHeight,
      { isStatic: true },
    );

    const rightWall = Matter.Bodies.rectangle(
      windowWidth + 25,
      windowHeight / 2,
      50,
      windowHeight,
      { isStatic: true },
    );

    Matter.World.add(world, [ground, leftWall, rightWall]);
  }
});

// Clean up on slide change
Reveal.addEventListener("slidechanged", () => {
  // Reset if going back to first slide
  if (Reveal.getIndices().h === 0) {
    resetSlide();

    // Restart animation after delay
    setTimeout(() => {
      startDisintegration();
    }, 1500);
  }
});
