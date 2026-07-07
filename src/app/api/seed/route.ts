import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    await User.deleteMany({});
    await Post.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
        // State Officer (offL2) — covers all of Maharashtra
        {
            name: 'State Officer Maharashtra',
            email: 'state.officer@civic.com',
            password,
            role: 'offL2',
            location: { area: 'Kothrud', state: 'Maharashtra' },
        },
        // Area Officers (offL1) — one per area
        {
            name: 'Officer Kothrud',
            email: 'officer.kothrud@civic.com',
            password,
            role: 'offL1',
            location: { area: 'Kothrud', state: 'Maharashtra' },
        },
        {
            name: 'Officer Bavdhan',
            email: 'officer.bavdhan@civic.com',
            password,
            role: 'offL1',
            location: { area: 'Bavdhan', state: 'Maharashtra' },
        },
        {
            name: 'Officer Bhugaon',
            email: 'officer.bhugaon@civic.com',
            password,
            role: 'offL1',
            location: { area: 'Bhugaon', state: 'Maharashtra' },
        },
        // Regular Citizens
        {
            name: 'Rahul Kothrud',
            email: 'rahul@civic.com',
            password,
            role: 'user',
            location: { area: 'Kothrud', state: 'Maharashtra' },
        },
        {
            name: 'Priya Bavdhan',
            email: 'priya@civic.com',
            password,
            role: 'user',
            location: { area: 'Bavdhan', state: 'Maharashtra' },
        },
        {
            name: 'Amit Bhugaon',
            email: 'amit@civic.com',
            password,
            role: 'user',
            location: { area: 'Bhugaon', state: 'Maharashtra' },
        },
    ])
    const u = (email: string) => users.find(u => u.email === email)!._id;

    await Post.insertMany([
        // Kothrud area posts
        {
            authorId: u('rahul@civic.com'),
            title: 'Broken streetlight near Kothrud bus stop',
            description: 'The streetlight near main bus stop has been broken for 2 weeks. Very unsafe at night.',
            postedIn: 'area', area: 'Kothrud', state: 'Maharashtra',
            agrees: 45, disagrees: 2, views: 120, status: 'NotSeen',
        },
        {
            authorId: u('rahul@civic.com'),
            title: 'Garbage not collected for 5 days in Kothrud',
            description: 'Municipal garbage truck has not visited our lane for 5 days. Smell is unbearable.',
            postedIn: 'area', area: 'Kothrud', state: 'Maharashtra',
            agrees: 78, disagrees: 1, views: 200, status: 'TakenIntoConsideration',
        },
        {
            authorId: u('rahul@civic.com'),
            title: 'Pothole on Kothrud main road',
            description: 'Large pothole near Kothrud depot causing accidents.',
            postedIn: 'area', area: 'Kothrud', state: 'Maharashtra',
            agrees: 30, disagrees: 5, views: 90, status: 'WorkStarted',
        },
        // Bavdhan area posts
        {
            authorId: u('priya@civic.com'),
            title: 'Water supply disrupted in Bavdhan',
            description: 'No water supply for the past 3 days in Bavdhan sector 2.',
            postedIn: 'area', area: 'Bavdhan', state: 'Maharashtra',
            agrees: 60, disagrees: 0, views: 150, status: 'NotSeen',
        },
        {
            authorId: u('priya@civic.com'),
            title: 'Illegal construction blocking road in Bavdhan',
            description: 'Unauthorized construction material dumped on main road causing traffic.',
            postedIn: 'area', area: 'Bavdhan', state: 'Maharashtra',
            agrees: 22, disagrees: 3, views: 75, status: 'Declined',
        },
        // Bhugaon area posts
        {
            authorId: u('amit@civic.com'),
            title: 'School road in Bhugaon flooded every rain',
            description: 'Children cannot reach school safely during monsoon due to flooding.',
            postedIn: 'area', area: 'Bhugaon', state: 'Maharashtra',
            agrees: 90, disagrees: 0, views: 300, status: 'NotSeen',
        },
        {
            authorId: u('amit@civic.com'),
            title: 'No street lights in Bhugaon colony',
            description: 'Entire colony has been without streetlights for a month.',
            postedIn: 'area', area: 'Bhugaon', state: 'Maharashtra',
            agrees: 55, disagrees: 2, views: 180, status: 'WorkStarted',
        },
        // State-level posts
        {
            authorId: u('rahul@civic.com'),
            title: 'Maharashtra road repair budget misused',
            description: 'State-level investigation needed into road repair funds.',
            postedIn: 'state', area: 'Kothrud', state: 'Maharashtra',
            agrees: 200, disagrees: 30, views: 800, status: 'NotSeen',
        },
        {
            authorId: u('priya@civic.com'),
            title: 'Demand for better public transport across Maharashtra',
            description: 'Citizens across all areas demand more frequent bus services.',
            postedIn: 'state', area: 'Bavdhan', state: 'Maharashtra',
            agrees: 350, disagrees: 10, views: 1200, status: 'TakenIntoConsideration',
        },
    ])

    return NextResponse.json({
        message: '✅ Database seeded successfully!',
        users: users.length,
        posts: 9,
    });

}