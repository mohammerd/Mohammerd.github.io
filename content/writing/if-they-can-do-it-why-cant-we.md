---
title: "If They Can Do It, Why Can't We?"
date: '2026-11-21'
description: 'How growing up around farming and my first agricultural chatbot led me to build AgroGuardAI.'
---

I grew up around farming. When I was young, I remember following my father to the farm and seeing the work that went into growing crops. I also saw the challenges farmers had to deal with, especially pests and diseases that could damage their crops.

Those experiences stayed with me. As I grew older, I began thinking about how technology could help address some of the problems affecting farmers in my community.

I later started studying Computer Software Engineering at Katsina State Institute of Technology and Management (KSITM). Around that time, I discovered artificial intelligence and became fascinated by it. I started learning how AI works, experimenting with different models, and following what people were building.

Whenever I opened X, I saw new models being released and people using them to build things I had never imagined. It made me ask myself: **If they can do it, why can't we use this technology to solve problems in our own communities?**

That question led to AgroGuardAI.

## The first attempt

The idea began taking shape around a Google DeepMind hackathon towards the end of 2025. I didn't make it through, but I kept working on the idea.

I built my first prototype: an agricultural chatbot powered by general-purpose AI APIs, including OpenAI, DeepSeek, and Google Gemini. I wanted farmers to ask questions and get useful information about farming.

Then I tested it with local farmers.

One problem became clear when we tried using Hausa. The chatbot struggled to communicate correctly in the language. It also gave unreliable answers to agricultural questions and sometimes hallucinated when offering farming advice.

I realised that connecting general-purpose models to an agricultural interface did not automatically make them understand agriculture or the people I wanted to serve. Farmers need systems that can communicate in their languages and take local farming conditions seriously.

I also wanted the chatbot to work offline because many villages have unreliable electricity and limited internet access. Offline AI could reduce dependence on a constant connection, but it would not solve the power problem. The model would still need suitable local hardware, low power consumption, and a practical way to recharge it. These are constraints I want to design around from the beginning.

## When advice leaves the screen

This is not just a problem I encountered with my first prototype. In a 2023 study, researchers tested GPT-generated agricultural advice for Nigerian cassava farmers. The answers could be too general to account for different crop growth stages, or recommend materials that smallholders could not afford. The researchers noted that the recommendations were not necessarily technically inaccurate, but they were not particularly helpful for the farmers they were meant to support. You can read the [study in Nature Food](https://www.nature.com/articles/s43016-023-00867-x) and [IFPRI's explanation of the findings](https://www.ifpri.org/blog/can-we-trust-ai-generate-agricultural-extension-advisories/).

The consequences can be much worse when a farmer acts on an answer. In July 2026, a 67-year-old farmer in Chuzhou, Anhui, China, asked an AI assistant for a weed- and pest-control plan for his sesame field, including a version for drone spraying. The assistant recommended a mixture that included fomesafen, a herbicide that local agricultural technicians said was unsuitable for spraying across sesame. According to the report by Litchi News, the farmer applied the mixture to his 150-mu field—about 10 hectares or 25 acres—and the sesame seedlings reportedly withered and died by the following day. The AI product was not publicly identified, so the incident should not be attributed to any particular model or company. [The report was republished by Sina](https://finance.sina.com.cn/jjxw/2026-08-01/doc-inikurwm3938905.shtml).

This was not just an incorrect answer on a screen. It was a recommendation involving real chemicals, a real field, and a farmer's investment in a growing season. The app displayed a small warning that AI-generated information could be wrong, but the farmer said he had not noticed it. A disclaimer cannot replace a system designed to avoid giving unsafe advice in the first place.

There is more evidence that these risks need to be taken seriously. A 2026 [FAO-funded evaluation of five agricultural AI advisory systems](https://www.fao.org/agroecology/in-action/detail/1681631/en) found that some systems gave too much priority to chemical control, including broad-spectrum insecticide recommendations without adequate supporting evidence, while giving less attention to approaches such as biological control and soil health. The study was exploratory and covered a limited set of crops and locations, so it does not show that every agricultural AI system behaves this way. It does show why these tools need independent testing.

Even AI systems that identify crop diseases from photographs face a similar problem. A [2026 review of crop-disease detection research](https://link.springer.com/article/10.1007/s42452-026-08684-0) found that models can perform very well on controlled image datasets but become less reliable in real field conditions, where lighting, backgrounds, crop varieties, and overlapping symptoms are harder to predict.

These findings point to a basic requirement: an agricultural AI system should not simply produce an answer that sounds convincing. It needs to know whether that answer applies to the crop, location, growth stage, and conditions in front of the farmer. When it does not have enough reliable information, it should ask questions or admit that it does not know.

## From a chatbot to a bigger vision

Those early tests made me rethink the architecture. I later renamed the consumer-facing chatbot **AgroMind** and began shaping AgroGuardAI into a broader agricultural AI ecosystem.

AI cannot solve every problem in agriculture. In Nigeria, farmers face challenges that include changing climate conditions, limited irrigation, land degradation, high production costs, inadequate financing, post-harvest losses, poor market access, and limited access to agricultural extension services. These are among the structural constraints described by the [FAO's overview of agriculture in Nigeria](https://www.fao.org/nigeria/fao-in-nigeria/nigeria-at-a-glance) and [research on agricultural extension in Nigeria](https://www.ifpri.org/blog/can-we-trust-ai-generate-agricultural-extension-advisories/). A chatbot cannot build roads, provide irrigation, or make farm inputs affordable. But it could help address one important gap: access to useful, understandable, and locally relevant agricultural knowledge.

The vision is to research and adapt open-source language models so they can better understand African languages and agricultural contexts. I want to explore systems that can support farmers with local agricultural knowledge, crop problems, pest and disease management, and weather-related questions, while treating reliability and safety as core requirements.

That means working towards agricultural knowledge reviewed by experts, testing with real farmers and local-language speakers, and evaluating systems against the conditions they will actually face. For high-risk advice, especially pesticide and herbicide recommendations, I want the system to verify the relevant information and ask for missing details rather than confidently guessing. These are research goals I am working towards, not capabilities I claim to have perfected.

AgroMind is intended to make that work accessible through a simple chatbot. One commitment matters to me: **the farmer-facing chatbot will remain free forever.**

Further ahead, I also want to explore how agricultural intelligence could connect with physical technologies such as drones, ground rovers, and sprayers. That is a longer-term ambition, not something AgroGuardAI has already delivered.

## Why I keep building

This began with memories of following my father to the farm. Discovering AI gave me another way to think about the challenges I had seen growing up.

Building the first chatbot taught me that powerful models alone are not enough. A system can sound convincing and still fail the people it was built to help.

I want AgroGuardAI to approach the problem differently, with African languages, agricultural context, accessibility, and safety at its foundation.

I didn't start with a perfect solution. I started with a problem I understood, built something, saw where it failed, and decided to keep going.

**That is the story behind AgroGuardAI.**
