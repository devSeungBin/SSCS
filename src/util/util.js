class RandomImageGenerator {
    getRandomHex() {
        return Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }

    getRandomColor() {
        return `#${this.getRandomHex()}${this.getRandomHex()}${this.getRandomHex()}`;
    }

    getRandomAngle() {
        return Math.floor(Math.random() * 360);
    }

    getRandomImage() {
        const angle = this.getRandomAngle();
        const color1 = this.getRandomColor();
        const color2 = this.getRandomColor();
        
        return `linear-gradient(${angle}deg, ${color1} 9.55%, ${color2} 92.46%)`;
    }
}

exports.RandomImageGenerator = RandomImageGenerator;
