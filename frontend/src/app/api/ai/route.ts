import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { ingredients, preferences } = await request.json();
    
    // This is where you'd make the actual call to Azure OpenAI
    // using your secure API keys stored in environment variables
    
    // For the hackathon, we'll return a mock response
    const recommendation = generateMockRecommendation(ingredients, preferences);
    
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Mock helper for the hackathon demo
function generateMockRecommendation(ingredients: string[], preferences: string): string {
  if (ingredients.includes("tomato") && ingredients.includes("pasta")) {
    return "I recommend making a simple pasta with tomato sauce to use up your tomatoes. Add herbs like basil if you have them for extra flavor!";
  }
  
  if (ingredients.includes("bread") && ingredients.includes("cheese")) {
    return "Your bread and cheese are perfect for making grilled cheese sandwiches. This is a great way to use bread that's getting stale!";
  }
  
  if (ingredients.includes("banana") && ingredients.includes("milk")) {
    return "Those bananas would be perfect in a smoothie with milk. Add a spoonful of honey if you like it sweeter!";
  }
  
  // Default recommendation
  return `Based on your ingredients (${ingredients.join(", ")}) and your preferences (${preferences}), I recommend creating a simple stir-fry. This is an excellent way to use up vegetables before they spoil.`;
}