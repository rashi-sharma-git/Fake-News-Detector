import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing content:', { hasText: !!text, hasImage: !!imageUrl });

    // Build the message content based on what was provided
    const userContent: any[] = [];
    
    if (text && text.trim()) {
      userContent.push({
        type: "text",
        text: `Analyze this text and determine if it's likely to be fake news or real news. Consider: 
        - Sensationalist language
        - Verifiable facts vs claims
        - Emotional manipulation
        - Source credibility indicators
        
        Text to analyze: "${text}"
        
        Respond in JSON format with: {"result": "fake" or "real", "confidence": 0-100, "keywords": ["keyword1", "keyword2"], "explanation": "brief explanation"}`
      });
    }
    
    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
      
      if (!text || !text.trim()) {
        userContent.unshift({
          type: "text",
          text: `Analyze this image and determine if it's likely to be manipulated, fake, or authentic. Consider:
          - Signs of digital manipulation
          - Inconsistencies in lighting or shadows
          - Unnatural elements
          - Context clues
          
          Respond in JSON format with: {"result": "fake" or "real", "confidence": 0-100, "keywords": ["keyword1", "keyword2"], "explanation": "brief explanation"}`
        });
      } else {
        userContent[0].text += `\n\nAlso analyze the provided image for any signs of manipulation or inconsistencies that might support or contradict the text.`;
      }
    }

    if (userContent.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fake news detector with expertise in identifying misinformation, manipulated images, and misleading content. Provide accurate, balanced analysis.'
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const aiMessage = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       aiMessage.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiMessage;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: try to extract information from text response
      analysis = {
        result: aiMessage.toLowerCase().includes('fake') ? 'fake' : 'real',
        confidence: 75,
        keywords: ['AI analysis'],
        explanation: aiMessage.substring(0, 200)
      };
    }

    console.log('Analysis complete:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to analyze content'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
