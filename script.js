// Global z-index counter
let highestZ = 1;

class Paper {
    // --- PROPERTIES (INITIAL STATE) ---
    holdingPaper = false;
    isRotating = false;

    // Mouse/Touch Tracking
    startX = 0; // Point where drag/touch started
    startY = 0;
    currentX = 0; // Current paper position offset
    currentY = 0;
    
    // Rotation & Velocity
    rotation = Math.random() * 30 - 15; // Initial random rotation for scattered look
    velX = 0;
    velY = 0;
    
    // DOM Element
    paperElement;

    constructor(paperElement) {
        this.paperElement = paperElement;
        // Apply initial rotation immediately
        this.paperElement.style.transform = `translateX(0px) translateY(0px) rotateZ(${this.rotation}deg)`;
        this.initEventListeners();
    }

    // --- EVENT HANDLERS ---

    // Unified function to get X and Y coordinates from Mouse or Touch event
    getCoordinates(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    handleStart = (e) => {
        // Prevent default browser drag behavior
        e.preventDefault(); 
        
        if (this.holdingPaper) return;
        this.holdingPaper = true;
        
        // Bring paper to front
        this.paperElement.style.zIndex = highestZ++;
        
        const coords = this.getCoordinates(e);
        
        this.startX = coords.x;
        this.startY = coords.y;
        
        // Right-click or two-finger touch for rotation
        if (e.button === 2 || (e.touches && e.touches.length === 2)) {
            this.isRotating = true;
        } else {
             this.isRotating = false;
        }

        // Attach listeners to the DOCUMENT/WINDOW for seamless dragging
        document.addEventListener('mousemove', this.handleMove);
        document.addEventListener('touchmove', this.handleMove, { passive: false });
        window.addEventListener('mouseup', this.handleEnd);
        window.addEventListener('touchend', this.handleEnd);
    }

    handleMove = (e) => {
        if (!this.holdingPaper) return;
        
        const coords = this.getCoordinates(e);
        const currentMouseX = coords.x;
        const currentMouseY = coords.y;
        
        // Velocity (for physics/animation later, if needed)
        this.velX = currentMouseX - this.startX; 
        this.velY = currentMouseY - this.startY;

        const deltaX = currentMouseX - this.startX;
        const deltaY = currentMouseY - this.startY;
        
        if (this.isRotating) {
            // Calculate rotation based on cursor position relative to start point
            const angle = Math.atan2(deltaY, deltaX);
            this.rotation = (180 * angle / Math.PI + 360) % 360; // Convert to 0-360 degrees
        } else {
            // Update paper position
            this.currentX += deltaX;
            this.currentY += deltaY;
        }
        
        // Update start position for the next move event
        this.startX = currentMouseX;
        this.startY = currentMouseY;

        // Apply transformations using CSS translate3d for better performance (hardware acceleration)
        this.paperElement.style.transform = `translateX(${this.currentX}px) translateY(${this.currentY}px) rotateZ(${this.rotation}deg)`;
    }

    handleEnd = () => {
        this.holdingPaper = false;
        this.isRotating = false;
        
        // REMOVE listeners to prevent memory leaks and unnecessary processing
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        window.removeEventListener('mouseup', this.handleEnd);
        window.removeEventListener('touchend', this.handleEnd);
    }
    
    // --- INITIALIZATION ---
    
    initEventListeners() {
        // Mouse Events
        this.paperElement.addEventListener('mousedown', this.handleStart);
        // Context menu (right-click) prevention to allow custom rotation handling
        this.paperElement.addEventListener('contextmenu', (e) => e.preventDefault()); 

        // Touch Events
        this.paperElement.addEventListener('touchstart', this.handleStart, { passive: false });
    }
}

// --- MAIN EXECUTION ---
const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
    // Instantiate the class, passing the DOM element to the constructor
    new Paper(paper);
});