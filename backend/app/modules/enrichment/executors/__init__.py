"""Executors registered under their catalog ``executor_id`` names.

Each name below is the executor CLASS (constructor takes the sync Exa
client, ``common.SyncExaClient`` over ``ExaClient``; the two moltsets
executors take ``SyncMoltSetsClient``). ``resolve_executor`` in the
catalog registry returns the class; the worker instantiates it.
"""

from app.modules.enrichment.executors.classify_b2b_b2c import ClassifyB2bB2c
from app.modules.enrichment.executors.custom_prompt import CustomPrompt
from app.modules.enrichment.executors.find_company_domain import (
    FindCompanyDomain,
)
from app.modules.enrichment.executors.find_company_news import FindCompanyNews
from app.modules.enrichment.executors.find_competitors import FindCompetitors
from app.modules.enrichment.executors.find_core_values import FindCoreValues
from app.modules.enrichment.executors.find_decision_makers import (
    FindDecisionMakers,
)
from app.modules.enrichment.executors.find_free_trial import FindFreeTrial
from app.modules.enrichment.executors.find_funding import FindFunding
from app.modules.enrichment.executors.find_gtm_strategy import FindGtmStrategy
from app.modules.enrichment.executors.find_job_openings import FindJobOpenings
from app.modules.enrichment.executors.find_leadership_changes import (
    FindLeadershipChanges,
)
from app.modules.enrichment.executors.find_linkedin_highlights import (
    FindLinkedinHighlights,
)
from app.modules.enrichment.executors.find_pricing import FindPricing
from app.modules.enrichment.executors.find_product_categories import (
    FindProductCategories,
)
from app.modules.enrichment.executors.find_revenue import FindRevenue
from app.modules.enrichment.executors.find_revenue_model import FindRevenueModel
from app.modules.enrichment.executors.find_snapshot import FindSnapshot
from app.modules.enrichment.executors.find_social_profiles import (
    FindSocialProfiles,
)
from app.modules.enrichment.executors.find_tech_stack import FindTechStack
from app.modules.enrichment.executors.find_work_email import FindWorkEmail

find_company_domain = FindCompanyDomain
find_snapshot = FindSnapshot
find_revenue = FindRevenue
find_funding = FindFunding
find_company_news = FindCompanyNews
find_leadership_changes = FindLeadershipChanges
find_social_profiles = FindSocialProfiles
find_core_values = FindCoreValues
find_free_trial = FindFreeTrial
find_pricing = FindPricing
find_job_openings = FindJobOpenings
find_gtm_strategy = FindGtmStrategy
find_revenue_model = FindRevenueModel
find_product_categories = FindProductCategories
classify_b2b_b2c = ClassifyB2bB2c
find_competitors = FindCompetitors
find_tech_stack = FindTechStack
find_linkedin_highlights = FindLinkedinHighlights
custom_prompt = CustomPrompt
find_decision_makers = FindDecisionMakers
find_work_email = FindWorkEmail
