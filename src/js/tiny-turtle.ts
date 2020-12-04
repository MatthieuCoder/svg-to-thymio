/*
 *
 *  * This file is subject to the terms and conditions defined in
 *  * file 'LICENSE.txt', which is part of this source code package.
 *
 */

// tiny-turtle.js
// 2013-10-11
// Public Domain.
// For more information, see http://github.com/toolness/tiny-turtle.


export class TinyTurtle {

    position: { x: number; y: number };
    rotation: number = 90;
    isPenDown = true;
    penStyle: string = 'black';
    penWidth: number = 1;

    public constructor(private readonly canvas: HTMLCanvasElement) {
        this.position = {
            // See http://diveintohtml5.info/canvas.html#pixel-madness for
            // details on why we're offsetting by 0.5.
            x: canvas.width / 2 + 0.5,
            y: canvas.height / 2 + 0.5
        };
    }

    private static radians (rad: number): number {
        return 2 * Math.PI * (rad / 360);
    }

    public triangle (ctx: CanvasRenderingContext2D, base: number, height: number) {
        ctx.beginPath(); ctx.moveTo(0, -base / 2);
        ctx.lineTo(height, 0);
        ctx.lineTo(0, base / 2); ctx.closePath();
    }

    public rotate (deg: number) {
        this.rotation = (this.rotation + deg) % 360;
        if (this.rotation < 0) this.rotation += 360;
    }

    public penUp () {
        this.isPenDown = false;
        return this;
    }

    public penDown () {
        this.isPenDown = true;
        return this;
    }

    public forward (distance: number) {
        const origX = this.position.x, origY = this.position.y;
        this.position.x += Math.cos(TinyTurtle.radians(this.rotation)) * distance;
        this.position.y -= Math.sin(TinyTurtle.radians(this.rotation)) * distance;
        if (!this.isPenDown) return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = this.penStyle;
        ctx.lineWidth = this.penWidth;
        ctx.beginPath();
        ctx.moveTo(origX, origY);
        ctx.lineTo(this.position.x, this.position.y);
        ctx.stroke();
    }

    public stamp (size: number) {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.strokeStyle = ctx.fillStyle = this.penStyle;
        ctx.lineWidth = this.penWidth;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(-TinyTurtle.radians(this.rotation));
        this.triangle(ctx, size || 10, (size || 10) * 1.5);
        this.isPenDown ? ctx.fill() : ctx.stroke();
        ctx.restore();
        return self;
    }

    public left (deg: number) {
        this.rotate(deg);
        return this;
    }

    public right (deg: number) {
        this.rotate(-deg);
        return this;
    }

    public clear () {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public reset () {
        this.clear();
        this.position = {
            // See http://diveintohtml5.info/canvas.html#pixel-madness for
            // details on why we're offsetting by 0.5.
            x: this.canvas.width / 2 + 0.5,
            y: this.canvas.height / 2 + 0.5
        };
        this.rotation = 90;
    }

}
