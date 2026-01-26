package app.kaiz.command_center.application;

/**
 * Cost estimation and usage tracking for Claude API.
 *
 * PRICING (as of 2026, Claude 3.5 Sonnet):
 * - Input: $3.00 per 1M tokens
 * - Output: $15.00 per 1M tokens
 *
 * TOKEN ESTIMATION:
 * - System prompt: ~3,500 tokens (fixed cost per request)
 * - Average user input (text): ~50-100 tokens
 * - Average user input (with image description): ~200-500 tokens
 * - Average AI output: ~300-800 tokens
 *
 * ESTIMATED COST PER REQUEST:
 * - Simple text: ~$0.002 - $0.005
 * - With image analysis: ~$0.005 - $0.01
 * - With clarification flow: ~$0.003 - $0.007
 *
 * AVERAGE: ~$0.004 per request
 */
public final class CostEstimation {

    private CostEstimation() {}

    // Claude 3.5 Sonnet pricing (per 1M tokens)
    public static final double INPUT_COST_PER_MILLION = 3.00;
    public static final double OUTPUT_COST_PER_MILLION = 15.00;

    // Token estimates
    public static final int SYSTEM_PROMPT_TOKENS = 3500;
    public static final int AVG_USER_INPUT_TOKENS = 100;
    public static final int AVG_IMAGE_DESCRIPTION_TOKENS = 350;
    public static final int AVG_OUTPUT_TOKENS = 500;

    // Usage patterns (requests per day per user)
    public static final int LIGHT_USER_REQUESTS_PER_DAY = 3;
    public static final int MODERATE_USER_REQUESTS_PER_DAY = 8;
    public static final int HEAVY_USER_REQUESTS_PER_DAY = 20;

    /**
     * Calculate cost per request.
     */
    public static double calculateRequestCost(int inputTokens, int outputTokens) {
        double inputCost = (inputTokens / 1_000_000.0) * INPUT_COST_PER_MILLION;
        double outputCost = (outputTokens / 1_000_000.0) * OUTPUT_COST_PER_MILLION;
        return inputCost + outputCost;
    }

    /**
     * Calculate average cost per request (text only).
     */
    public static double averageTextRequestCost() {
        int totalInput = SYSTEM_PROMPT_TOKENS + AVG_USER_INPUT_TOKENS;
        return calculateRequestCost(totalInput, AVG_OUTPUT_TOKENS);
    }

    /**
     * Calculate average cost per request (with image).
     */
    public static double averageImageRequestCost() {
        int totalInput = SYSTEM_PROMPT_TOKENS + AVG_IMAGE_DESCRIPTION_TOKENS;
        return calculateRequestCost(totalInput, AVG_OUTPUT_TOKENS);
    }

    // =========================================================================
    // USAGE ESTIMATES & PRICING RECOMMENDATIONS
    // =========================================================================

    /**
     * Monthly cost estimate per user type.
     *
     * Light user: 3 requests/day = ~90/month = ~$0.36/month
     * Moderate user: 8 requests/day = ~240/month = ~$0.96/month
     * Heavy user: 20 requests/day = ~600/month = ~$2.40/month
     *
     * With 20% buffer for retries/errors: multiply by 1.2
     */
    public static MonthlyEstimate calculateMonthlyEstimate(UserType userType) {
        int requestsPerDay = switch (userType) {
            case LIGHT -> LIGHT_USER_REQUESTS_PER_DAY;
            case MODERATE -> MODERATE_USER_REQUESTS_PER_DAY;
            case HEAVY -> HEAVY_USER_REQUESTS_PER_DAY;
        };

        int requestsPerMonth = requestsPerDay * 30;
        double avgCostPerRequest = averageTextRequestCost();
        double baseCost = requestsPerMonth * avgCostPerRequest;
        double withBuffer = baseCost * 1.2; // 20% buffer

        return new MonthlyEstimate(userType, requestsPerMonth, baseCost, withBuffer);
    }

    public enum UserType {
        LIGHT,      // Casual user, few inputs per day
        MODERATE,   // Regular user, daily engagement
        HEAVY       // Power user, frequent interactions
    }

    public record MonthlyEstimate(
            UserType userType,
            int requestsPerMonth,
            double baseCost,
            double costWithBuffer) {}

    // =========================================================================
    // PRICING RECOMMENDATIONS
    // =========================================================================

    /**
     * Recommended subscription pricing.
     *
     * INDIVIDUAL PLANS:
     * ─────────────────────────────────────────────────────────────────────────
     * | Plan      | AI Requests | Est. Cost | Margin | Monthly | Annual      |
     * |-----------|-------------|-----------|--------|---------|-------------|
     * | Free      | 30/month    | $0.12     | N/A    | $0      | $0          |
     * | Basic     | 150/month   | $0.60     | 5x     | $2.99   | $29/year    |
     * | Pro       | 500/month   | $2.00     | 4x     | $7.99   | $79/year    |
     * | Unlimited | Unlimited   | ~$3-5     | 3x     | $14.99  | $149/year   |
     * ─────────────────────────────────────────────────────────────────────────
     *
     * FAMILY PLAN (up to 6 members):
     * ─────────────────────────────────────────────────────────────────────────
     * | Plan         | Per Member | Total Est. | Monthly  | Annual       |
     * |--------------|------------|------------|----------|--------------|
     * | Family Basic | 150/month  | $3.60      | $9.99    | $99/year     |
     * | Family Pro   | 500/month  | $12.00     | $19.99   | $199/year    |
     * | Family Ultra | Unlimited  | ~$20-30    | $29.99   | $299/year    |
     * ─────────────────────────────────────────────────────────────────────────
     *
     * NOTES:
     * - Free tier: 1 request/day average, good for trial
     * - Basic: 5 requests/day, covers light users
     * - Pro: ~17 requests/day, covers moderate to heavy users
     * - Family plans assume 6 active members (often 3-4 active)
     * - Annual pricing = 2 months free
     */
    public static PricingRecommendation getIndividualPricing() {
        return new PricingRecommendation(
                "Individual",
                new PlanTier("Free", 30, 0.0, 0.0, 0.0),
                new PlanTier("Basic", 150, 2.99, 29.0, 0.60),
                new PlanTier("Pro", 500, 7.99, 79.0, 2.00),
                new PlanTier("Unlimited", -1, 14.99, 149.0, 5.00)
        );
    }

    public static PricingRecommendation getFamilyPricing() {
        return new PricingRecommendation(
                "Family (up to 6)",
                new PlanTier("Free", 30, 0.0, 0.0, 0.72), // 30 shared
                new PlanTier("Basic", 900, 9.99, 99.0, 3.60), // 150 x 6
                new PlanTier("Pro", 3000, 19.99, 199.0, 12.00), // 500 x 6
                new PlanTier("Ultra", -1, 29.99, 299.0, 25.00)
        );
    }

    public record PricingRecommendation(
            String planType,
            PlanTier freeTier,
            PlanTier basicTier,
            PlanTier proTier,
            PlanTier premiumTier) {}

    public record PlanTier(
            String name,
            int aiRequestsPerMonth, // -1 for unlimited
            double monthlyPrice,
            double annualPrice,
            double estimatedCost) {}

    // =========================================================================
    // COST OPTIMIZATION STRATEGIES
    // =========================================================================

    /**
     * Strategies to reduce AI costs:
     *
     * 1. CACHING - Cache common responses
     *    - "call mom" → cached task template
     *    - Reduces redundant API calls by ~30%
     *
     * 2. SHORTER SYSTEM PROMPT - Use dynamic prompt loading
     *    - Only include relevant sections based on detected intent
     *    - Can reduce input tokens by ~40%
     *
     * 3. PROMPT CACHING (Anthropic feature)
     *    - System prompt cached on Anthropic's side
     *    - 90% discount on cached tokens
     *    - Reduces effective input cost significantly
     *
     * 4. BATCH PROCESSING - For background tasks
     *    - 50% discount on batch API
     *    - Good for nightly analysis, suggestions
     *
     * 5. TIERED MODEL SELECTION
     *    - Simple inputs → Claude Haiku ($0.25/1M input)
     *    - Complex inputs → Claude Sonnet ($3/1M input)
     *    - Reduces average cost by ~50%
     *
     * 6. REQUEST THROTTLING
     *    - Rate limit per user per day
     *    - Queue non-urgent requests
     *
     * 7. LOCAL PREPROCESSING
     *    - Use regex/rules for obvious intents
     *    - "buy milk" → instant task, no AI needed
     *    - Can handle ~20% of requests locally
     */
    public static final String OPTIMIZATION_NOTES = """
        Cost Optimization Implemented:
        1. ✅ Prompt caching (via Spring AI)
        2. ✅ Structured output (reduces token waste)
        3. 🔄 TODO: Tiered model selection (Haiku for simple)
        4. 🔄 TODO: Local intent detection for simple cases
        5. 🔄 TODO: Response caching for common patterns
        """;
}
