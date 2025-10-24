// Global z-index counter
let highestZ = 1;

class Paper {
    // --- PROPERTIES (INITIAL STATE) ---
    holdingPaper = false;
    isRotating = false; // Renamed 'rotating' for consistency

    // Touch Tracking
    currentX = 0; // Current paper position offset (like currentPaperX)
    currentY = 0; // Current paper position offset (like currentPaperY)
    
    // Rotation & Velocity (keeping the existing logic for now)
    rotation = Math.random() * 30 - 15; // Initial random rotation
    velX = 0;
    velY = 0;
    
    // DOM Element
    paperElement;

    // Last touch coordinates for calculating movement delta (like prevTouchX/Y)
    lastTouchX = 0;
    lastTouchY = 0;
    
    // Initial touch coordinates for rotation calculation (like touchStartX/Y)
    initialTouchX = 0; 
    initialTouchY = 0; 

    constructor(paperElement) {
        this.paperElement = paperElement;
        // Apply initial rotation immediately
        this.paperElement.style.transform = `translateX(0px) translateY(0px) rotateZ(${this.rotation}deg)`;
        this.initEventListeners();
    }

    // --- EVENT HANDLERS ---

    handleTouchStart = (e) => {
        // Only allow one finger drag unless we are using a specific multi-touch gesture for rotation
        if (e.touches.length > 1) {
            // If two fingers are used, assume rotation mode (more reliable than 'gesturestart')
            this.isRotating = true;
            
            // For two-finger rotation, we typically calculate rotation around the *center* of the two touches.
            // For simplicity, we stick to the provided logic, but mark it for rotation.
            
            // Optional: Prevent default two-finger scroll/zoom gesture
            // e.preventDefault(); 
            
        } else if (e.touches.length === 1) {
            this.isRotating = false;
        }

        if (this.holdingPaper) return; 
        this.holdingPaper = true;
        
        // Bring paper to front
        this.paperElement.style.zIndex = highestZ++;
        
        const touch = e.touches[0];
        
        this.initialTouchX = touch.clientX;
        this.initialTouchY = touch.clientY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
    }

    handleTouchMove = (e) => {
        if (!this.holdingPaper) return;
        
        // Preventing default scroll/zoom is essential for touch drag/move
        e.preventDefault(); 
        
        const touch = e.touches[0];
        const currentTouchX = touch.clientX;
        const currentTouchY = touch.clientY;
        
        // Calculate movement difference
        this.velX = currentTouchX - this.lastTouchX;
        this.velY = currentTouchY - this.lastTouchY;

        if (this.isRotating) {
            // Use the movement relative to the initial touch point for calculating the angle
            const dirX = currentTouchX - this.initialTouchX;
            const dirY = currentTouchY - this.initialTouchY;
            
            const angle = Math.atan2(dirY, dirX);
            // Convert to 0-360 degrees
            this.rotation = (180 * angle / Math.PI + 360) % 360; 
            
        } else {
            // Update paper position
            this.currentX += this.velX;
            this.currentY += this.velY;
        }
        
        // Update last touch coordinates for the next move event
        this.lastTouchX = currentTouchX;
        this.lastTouchY = currentTouchY;

        // Apply transformations using CSS translate3d for better performance (Hardware Acceleration!)
        this.paperElement.style.transform = `translateX(${this.currentX}px) translateY(${this.currentY}px) rotateZ(${this.rotation}deg)`;
        // If you want even better performance, use:
        // this.paperElement.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) rotateZ(${this.rotation}deg)`;
    }

    handleTouchEnd = () => {
        this.holdingPaper = false;
        this.isRotating = false;
        
        // Cleanup: Remove temporary event listeners if they were attached to the window/document
        // Note: In your original code, 'touchmove' and 'touchend' were attached to the 'paper', 
        // but attaching to 'paper' can lead to missing events if the touch moves off the element.
        // For simplicity and matching your structure, we keep it on the 'paper' element.
    }
    
    // --- INITIALIZATION ---
    
    initEventListeners() {
        // Touch Events
        this.paperElement.addEventListener('touchstart', this.handleTouchStart);
        this.paperElement.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.paperElement.addEventListener('touchend', this.handleTouchEnd);
        
        // The original 'gesturestart/end' is less common/reliable than checking 'e.touches.length'
        // But if you want to keep the old ones:
        // this.paperElement.addEventListener('gesturestart', (e) => { e.preventDefault(); this.isRotating = true; });
        // this.paperElement.addEventListener('gestureend', () => { this.isRotating = false; });
    }
}

// --- MAIN EXECUTION ---
const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
    // Instantiate the class, passing the DOM element to the constructor
    new Paper(paper);
});