// app/api/webhooks/cr-banks/route.ts

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for CR banking data
let crBanksData: any = null;
let lastUpdated: string = '';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming data from n8n
    const data = await request.json();
    
    // Store the data in memory
    crBanksData = data;
    lastUpdated = new Date().toISOString();
    
    // Log for debugging
    console.log('✅ CR Banks data updated:', {
      totalTransactions: data.totalTransactions,
      yearlyTotal: data.yearlyTotal,
      limitPercentage: data.limitPercentage,
      alertStatus: data.alertStatus,
      updateTime: data.updateTime
    });
    
    // Return success response with key metrics
    return NextResponse.json({
      success: true,
      message: 'CR Banks data updated successfully',
      timestamp: lastUpdated,
      receivedData: {
        totalTransactions: data.totalTransactions,
        yearlyTotal: data.yearlyTotal,
        limitPercentage: data.limitPercentage.toFixed(1),
        alertStatus: data.alertStatus,
        todayTransactions: data.todayTransactionCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing CR Banks webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process CR Banks data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current CR banking data (for dashboard)
export async function GET() {
  try {
    if (!crBanksData) {
      return NextResponse.json(
        {
          success: false,
          message: 'No CR banking data available yet'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: crBanksData,
      lastUpdated: lastUpdated
    });
    
  } catch (error) {
    console.error('❌ Error retrieving CR Banks data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve CR Banks data'
      },
      { status: 500 }
    );
  }
}
