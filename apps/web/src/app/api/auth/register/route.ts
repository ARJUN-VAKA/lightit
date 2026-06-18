import { NextRequest, NextResponse } from 'next/server';
import { getMockDb, createDemoToken, MockUser } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, name, phone, company,
            investmentCapacityMin, investmentCapacityMax } = body;

    if (!email || !password || !role || !name) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password and role are required.' },
        { status: 400 }
      );
    }

    const db = getMockDb();

    if (db.has(email.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const user: MockUser = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      role: role as MockUser['role'],
      name,
      phone,
      company,
      emailVerified: true, // auto-verify for demo
      createdAt: new Date().toISOString(),
      ...(role === 'INVESTOR' && {
        investmentCapacityMin: investmentCapacityMin ?? 100_000,
        investmentCapacityMax: investmentCapacityMax ?? 5_000_000,
        preferredSectors: [],
        totalInvested: 0,
        investmentCount: 0,
        trustScore: 80,
      }),
    };

    db.set(email.toLowerCase(), user);

    const accessToken = createDemoToken(user);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      data: {
        accessToken,
        refreshToken: accessToken, // same for demo
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      },
    }, { status: 201 });

  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
